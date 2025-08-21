const express = require('express');
const axios = require('axios');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');

// GET /api/v1/user/profile - Get current user profile from 1Confirmed
router.get('/profile', auth, async (req, res) => {
  try {
    const user = req.user;
    
    // Check if user has 1Confirmed token
    if (!user.confirmed_token) {
      return res.status(400).json({
        success: false,
        message: 'No 1Confirmed token found. Please link your 1Confirmed account.'
      });
    }

    try {
      // Call 1Confirmed API
      const confirmedResponse = await axios.get('https://1confirmed.com/api/v1/user', {
        headers: {
          'Authorization': `Bearer ${user.confirmed_token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: 10000 // 10 seconds timeout
      });

      if (confirmedResponse.data.success) {
        const confirmedData = confirmedResponse.data.data;
        
        // Sync data with local user (optional)
        await User.findByIdAndUpdate(user._id, {
          credit: confirmedData.credit?.credit || user.credit,
          phone_verified_at: confirmedData.phone_verified_at,
          two_factor_enabled: confirmedData.two_factor_enabled,
          two_factor_verified: confirmedData.two_factor_verified,
          first_message_wizard_completed: confirmedData.first_message_wizard_completed,
          language: confirmedData.language || user.language
        });

        // Return data in your API format
        return res.json({
          success: true,
          data: {
            id: user._id,
            name: confirmedData.name || user.name,
            email: confirmedData.email || user.email,
            phone: confirmedData.phone || user.phone,
            language: confirmedData.language,
            phone_verified_at: confirmedData.phone_verified_at,
            two_factor_enabled: confirmedData.two_factor_enabled,
            two_factor_verified: confirmedData.two_factor_verified,
            first_message_wizard_completed: confirmedData.first_message_wizard_completed,
            roles: confirmedData.roles || user.roles,
            credit: confirmedData.credit?.credit || user.credit,
            subscription: confirmedData.subscription,
            cr_account: confirmedData.cr_account,
            custom_credit: confirmedData.custom_credit || user.custom_credit,
            // Add SmartAquarv2 specific data
            aquarium_data: user.aquarium_data
          },
          message: 'Profile retrieved successfully from 1Confirmed'
        });
      } else {
        throw new Error('1Confirmed API returned unsuccessful response');
      }
    } catch (confirmedError) {
      console.error('1Confirmed API Error:', confirmedError.message);
      
      // Fallback to local user data if 1Confirmed fails
      return res.json({
        success: true,
        data: {
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
          credit: user.credit,
          subscription: user.subscription,
          custom_credit: user.custom_credit,
          aquarium_data: user.aquarium_data
        },
        message: 'Profile retrieved from local data (1Confirmed unavailable)',
        warning: '1Confirmed service temporarily unavailable'
      });
    }
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching profile'
    });
  }
});

// PUT /api/v1/user/profile - Update user profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, phone, language } = req.body;
    const user = req.user;
    
    // Validation
    if (!name || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Name and phone are required'
      });
    }

    // Update local user data
    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      { name, phone, language },
      { new: true }
    );

    // If user has 1Confirmed token, try to sync (optional)
    if (user.confirmed_token) {
      try {
        await updatedUser.syncWith1Confirmed();
      } catch (syncError) {
        console.warn('Could not sync with 1Confirmed:', syncError.message);
      }
    }

    res.json({
      success: true,
      data: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        language: updatedUser.language,
        credit: updatedUser.credit,
        roles: updatedUser.roles
      },
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating profile'
    });
  }
});

// GET /api/v1/user/credit - Get user credit balance from 1Confirmed
router.get('/credit', auth, async (req, res) => {
  try {
    const user = req.user;
    
    if (user.confirmed_token) {
      try {
        const confirmedResponse = await axios.get('https://1confirmed.com/api/v1/user', {
          headers: {
            'Authorization': `Bearer ${user.confirmed_token}`,
            'Content-Type': 'application/json'
          },
          timeout: 5000
        });

        if (confirmedResponse.data.success) {
          const credit = confirmedResponse.data.data.credit?.credit || user.credit;
          
          // Update local credit
          await User.findByIdAndUpdate(user._id, { credit });
          
          return res.json({
            success: true,
            data: { credit },
            message: 'Credit balance retrieved from 1Confirmed'
          });
        }
      } catch (error) {
        console.warn('1Confirmed credit fetch failed:', error.message);
      }
    }

    // Fallback to local credit
    res.json({
      success: true,
      data: {
        credit: user.credit
      },
      message: 'Credit balance retrieved from local data'
    });
  } catch (error) {
    console.error('Credit fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching credit balance'
    });
  }
});

// POST /api/v1/user/link-confirmed - Link 1Confirmed account
router.post('/link-confirmed', auth, async (req, res) => {
  try {
    const { confirmed_token } = req.body;
    
    if (!confirmed_token) {
      return res.status(400).json({
        success: false,
        message: '1Confirmed token is required'
      });
    }

    // Verify token with 1Confirmed API
    try {
      const confirmedResponse = await axios.get('https://1confirmed.com/api/v1/user', {
        headers: {
          'Authorization': `Bearer ${confirmed_token}`,
          'Content-Type': 'application/json'
        }
      });

      if (confirmedResponse.data.success) {
        const confirmedData = confirmedResponse.data.data;
        
        // Update user with 1Confirmed data
        const updatedUser = await User.findByIdAndUpdate(
          req.user._id,
          {
            confirmed_user_id: confirmedData.id,
            confirmed_token: confirmed_token,
            credit: confirmedData.credit?.credit || req.user.credit,
            phone_verified_at: confirmedData.phone_verified_at,
            two_factor_enabled: confirmedData.two_factor_enabled,
            two_factor_verified: confirmedData.two_factor_verified
          },
          { new: true }
        );

        res.json({
          success: true,
          message: '1Confirmed account linked successfully',
          data: {
            confirmed_user_id: confirmedData.id,
            credit: confirmedData.credit?.credit
          }
        });
      } else {
        throw new Error('Invalid 1Confirmed token');
      }
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Invalid 1Confirmed token or API error'
      });
    }
  } catch (error) {
    console.error('Link 1Confirmed error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while linking 1Confirmed account'
    });
  }
});

// GET /api/v1/user/sync-confirmed - Manually sync with 1Confirmed
router.get('/sync-confirmed', auth, async (req, res) => {
  try {
    const user = req.user;
    
    if (!user.confirmed_token) {
      return res.status(400).json({
        success: false,
        message: 'No 1Confirmed account linked'
      });
    }

    const syncSuccess = await user.syncWith1Confirmed();
    
    if (syncSuccess) {
      res.json({
        success: true,
        message: 'Successfully synced with 1Confirmed'
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Failed to sync with 1Confirmed'
      });
    }
  } catch (error) {
    console.error('Sync error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during sync'
    });
  }
});

module.exports = router;