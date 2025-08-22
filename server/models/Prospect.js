const mongoose = require('mongoose');

const prospectSchema = new mongoose.Schema({
  userId: { // Lien avec le user propriétaire
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  phone: { type: String, required: true, trim: true },
  status: { type: String, enum: ['hot', 'warm', 'cold', 'active'], default: 'active' },
  source: { type: String, default: 'unknown' },

  preferences: {
    budget: {
      min: { type: Number, default: 0 },
      max: { type: Number, default: 0 }
    },
    propertyTypes: [{ type: String }],
    locations: [{ type: String }],
    bedrooms: { type: Number, default: 0 },
    bathrooms: { type: Number, default: 0 },
    area: { min: Number, max: Number },
    features: [{ type: String }]
  },

  matchedProperties: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Property' }],
  lastContact: { type: Date, default: Date.now },
  notes: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Prospect', prospectSchema);
