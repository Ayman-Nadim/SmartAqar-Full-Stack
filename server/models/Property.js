const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Property title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  type: {
    type: String,
    required: [true, 'Property type is required'],
    enum: ['villa', 'apartment', 'house', 'commercial'],
    lowercase: true
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true
  },
  status: {
    type: String,
    enum: ['available', 'sold', 'pending'],
    default: 'available'
  },
  images: [{
    type: String,
    validate: {
      validator: function(v) {
        // More flexible URL validation that accepts query parameters
        return /^https?:\/\/.+/i.test(v);
      },
      message: 'Please provide a valid image URL'
    }
  }],
  bedrooms: {
    type: Number,
    min: [0, 'Bedrooms cannot be negative'],
    default: 0
  },
  bathrooms: {
    type: Number,
    min: [0, 'Bathrooms cannot be negative'],
    required: [true, 'Number of bathrooms is required']
  },
  area: {
    type: Number,
    min: [1, 'Area must be at least 1 square meter'],
    required: [true, 'Area is required']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  features: [{
    type: String,
    trim: true
  }],
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Property owner is required']
  },
  addedDate: {
    type: Date,
    default: Date.now
  },
  updatedDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for better query performance
propertySchema.index({ owner: 1, status: 1 });
propertySchema.index({ type: 1 });
propertySchema.index({ price: 1 });
propertySchema.index({ location: 'text', title: 'text', description: 'text' });

// Update updatedDate before saving
propertySchema.pre('save', function(next) {
  this.updatedDate = new Date();
  next();
});

// Virtual for formatted price
propertySchema.virtual('formattedPrice').get(function() {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'MAD',
    minimumFractionDigits: 0,
  }).format(this.price).replace('MAD', 'DH');
});

// Ensure virtual fields are serialized
propertySchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Property', propertySchema);