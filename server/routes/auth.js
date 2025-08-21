const express = require('express');
const { body, validationResult } = require('express-validator');
const axios = require('axios');
const User = require('../models/User');
const router = express.Router();

// Validation middleware
const registerValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('phone')
    .matches(/^\+\d{10,15}$/)
    .withMessage('Please provide a valid phone number with country code (e.g., +212660229045)'),
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('c_password')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Password confirmation does not match password');
      }
      return true;
    }),
  body('country_code')
    .trim()
    .isLength({ min: 2, max: 2 })
    .matches(/^[A-Za-z]{2}$/)
    .withMessage('Country code must be a valid 2-letter code (e.g., MA, FR, US)')
];

// Register endpoint with 1Confirmed integration
router.post('/register', registerValidation, async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email, phone, name, password, c_password, country_code } = req.body;

    // Check if user already exists in our database
    const existingUser = await User.findOne({
      $or: [{ email }, { phone }]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: existingUser.email === email 
          ? 'User with this email already exists' 
          : 'User with this phone number already exists'
      });
    }

    // ====== ÉTAPE 1: REGISTRATION CHEZ 1CONFIRMED ======
    let confirmedApiData;
    try {
      console.log('📡 Registering user with 1Confirmed API...');
      
      const confirmedResponse = await axios.post(
        'https://1confirmed.com/api/v1/register',
        {
          email,
          phone,
          name,
          password,
          c_password,
          country_code
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          timeout: 30000 // 30 seconds timeout
        }
      );

      if (confirmedResponse.data.success) {
        confirmedApiData = confirmedResponse.data.data;
        console.log('✅ 1Confirmed registration successful:', confirmedApiData.id);
      } else {
        throw new Error('1Confirmed registration failed');
      }
    } catch (confirmedError) {
      console.error('❌ 1Confirmed API Error:', confirmedError.response?.data || confirmedError.message);
      
      // Si l'API 1Confirmed échoue, on retourne l'erreur
      if (confirmedError.response?.data) {
        return res.status(400).json({
          success: false,
          message: '1Confirmed registration failed',
          error: confirmedError.response.data.message || '1Confirmed API error',
          details: confirmedError.response.data
        });
      }
      
      return res.status(500).json({
        success: false,
        message: 'External service unavailable. Please try again later.'
      });
    }

    // ====== ÉTAPE 2: SAUVEGARDE DANS NOTRE BASE DE DONNÉES ======
    console.log('💾 Saving user to SmartAquarv2 database...');
    
    // Create new user in our database with 1Confirmed data
    const user = new User({
      name: confirmedApiData.name,
      email: confirmedApiData.email,
      phone: confirmedApiData.phone,
      password, // Will be hashed by mongoose middleware
      country_code: country_code.toUpperCase(),
      
      // Data from 1Confirmed
      confirmed_user_id: confirmedApiData.id, // Store 1Confirmed user ID
      confirmed_token: confirmedApiData.token, // Store 1Confirmed token
      language: confirmedApiData.language,
      phone_verified_at: confirmedApiData.phone_verified_at,
      two_factor_enabled: confirmedApiData.two_factor_enabled,
      two_factor_verified: confirmedApiData.two_factor_verified,
      first_message_wizard_completed: confirmedApiData.first_message_wizard_completed,
      
      // SmartAquarv2 specific data
      roles: ['user'],
      credit: confirmedApiData.credit?.credit || 500,
      accounts: confirmedApiData.accounts || [],
      custom_credit: confirmedApiData.custom_credit || []
    });

    await user.save();
    console.log('✅ User saved to SmartAquarv2 database:', user._id);

    // ====== ÉTAPE 3: GENERATE LOCAL TOKEN ======
    const localToken = user.generateAuthToken();

    // ====== ÉTAPE 4: PREPARE RESPONSE ======
    const responseData = {
      // SmartAquarv2 data
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      language: user.language,
      phone_verified_at: user.phone_verified_at,
      two_factor_enabled: user.two_factor_enabled,
      two_factor_verified: user.two_factor_verified,
      first_message_wizard_completed: user.first_message_wizard_completed,
      roles: user.roles,
      credit: {
        id: user._id,
        credit: user.credit
      },
      subscription: user.subscription,
      cr_account: null,
      accounts: user.accounts,
      custom_credit: user.custom_credit,
      
      // Tokens
      token: localToken, // SmartAquarv2 token
      confirmed_token: user.confirmed_token, // 1Confirmed token
      
      // 1Confirmed reference
      confirmed_user_id: user.confirmed_user_id
    };

    res.status(201).json({
      success: true,
      data: responseData,
      message: 'User Created Successfully'
    });

  } catch (error) {
    console.error('💥 Registration error:', error);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `User with this ${field} already exists`
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ====== ENDPOINT POUR SYNC AVEC 1CONFIRMED ======
router.post('/sync-confirmed', async (req, res) => {
  try {
    const { confirmed_token } = req.body;
    
    if (!confirmed_token) {
      return res.status(400).json({
        success: false,
        message: 'Confirmed token required'
      });
    }

    // Make request to 1Confirmed API to get user profile
    const confirmedResponse = await axios.get(
      'https://1confirmed.com/api/v1/profile', // Assume this endpoint exists
      {
        headers: {
          'Authorization': `Bearer ${confirmed_token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (confirmedResponse.data.success) {
      // Update local user with 1Confirmed data
      const user = await User.findOne({ confirmed_token });
      
      if (user) {
        // Update fields that might have changed in 1Confirmed
        user.credit = confirmedResponse.data.data.credit?.credit || user.credit;
        user.phone_verified_at = confirmedResponse.data.data.phone_verified_at;
        user.two_factor_enabled = confirmedResponse.data.data.two_factor_enabled;
        user.two_factor_verified = confirmedResponse.data.data.two_factor_verified;
        
        await user.save();
        
        res.json({
          success: true,
          message: 'User synchronized with 1Confirmed successfully'
        });
      } else {
        res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
    }
  } catch (error) {
    console.error('Sync error:', error);
    res.status(500).json({
      success: false,
      message: 'Sync failed'
    });
  }
});

// Login endpoint (unchanged)
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate new token
    const token = user.generateAuthToken();

    // Prepare response data
    const responseData = {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      language: user.language,
      phone_verified_at: user.phone_verified_at,
      two_factor_enabled: user.two_factor_enabled,
      two_factor_verified: user.two_factor_verified,
      first_message_wizard_completed: user.first_message_wizard_completed,
      roles: user.roles,
      credit: {
        id: user._id,
        credit: user.credit
      },
      subscription: user.subscription,
      cr_account: null,
      accounts: user.accounts,
      token,
      confirmed_token: user.confirmed_token,
      confirmed_user_id: user.confirmed_user_id,
      custom_credit: user.custom_credit
    };

    res.json({
      success: true,
      data: responseData,
      message: 'Login successful'
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;