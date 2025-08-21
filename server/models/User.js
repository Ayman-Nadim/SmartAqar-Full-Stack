const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  country_code: {
    type: String,
    required: true,
    default: 'MA'
  },
  
  // ====== 1CONFIRMED INTEGRATION FIELDS ======
  confirmed_user_id: {
    type: Number, // 1Confirmed user ID
    unique: true,
    sparse: true // Allows null values to be non-unique
  },
  confirmed_token: {
    type: String, // 1Confirmed JWT token
    default: null
  },
  
  // ====== EXISTING FIELDS ======
  language: {
    type: String,
    default: null
  },
  phone_verified_at: {
    type: Date,
    default: null
  },
  two_factor_enabled: {
    type: Boolean,
    default: false
  },
  two_factor_verified: {
    type: Boolean,
    default: false
  },
  first_message_wizard_completed: {
    type: Boolean,
    default: false
  },
  roles: [{
    type: String,
    enum: ['user', 'admin', 'moderator']
  }],
  credit: {
    type: Number,
    default: 500
  },
  subscription: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subscription',
    default: null
  },
  accounts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account'
  }],
  custom_credit: [{
    type: String
  }],
  
  // ====== SMARTAQUARV2 SPECIFIC FIELDS ======
  aquarium_data: {
    tanks: [{
      name: String,
      size: Number,
      type: String,
      status: String
    }],
    sensors: [{
      type: String,
      value: Number,
      timestamp: Date
    }]
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Generate JWT token for SmartAquarv2
userSchema.methods.generateAuthToken = function() {
  const token = jwt.sign(
    { 
      sub: this._id.toString(),
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60), // 1 year
      aud: "smartaquarv2",
      scopes: [],
      confirmed_id: this.confirmed_user_id // Include 1Confirmed ID in token
    },
    process.env.JWT_SECRET,
    { algorithm: 'HS256' }
  );
  return token;
};

// Method to sync with 1Confirmed
userSchema.methods.syncWith1Confirmed = async function() {
  if (!this.confirmed_token) {
    throw new Error('No 1Confirmed token available');
  }
  
  try {
    const axios = require('axios');
    const response = await axios.get('https://1confirmed.com/api/v1/profile', {
      headers: {
        'Authorization': `Bearer ${this.confirmed_token}`
      }
    });
    
    if (response.data.success) {
      const data = response.data.data;
      this.credit = data.credit?.credit || this.credit;
      this.phone_verified_at = data.phone_verified_at;
      this.two_factor_enabled = data.two_factor_enabled;
      this.two_factor_verified = data.two_factor_verified;
      
      await this.save();
      return true;
    }
    return false;
  } catch (error) {
    console.error('Sync with 1Confirmed failed:', error);
    return false;
  }
};

module.exports = mongoose.model('User', userSchema);