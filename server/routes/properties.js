const express = require('express');
const Property = require('../models/Property');
const auth = require('../middleware/auth');
const router = express.Router();

// GET /api/v1/properties - Get all properties for authenticated user
router.get('/', auth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      type,
      status,
      search,
      minPrice,
      maxPrice,
      sortBy = 'addedDate',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = { owner: req.user._id };

    // Add type filter
    if (type && type !== 'all') {
      filter.type = type;
    }

    // Add status filter
    if (status && status !== 'all') {
      filter.status = status;
    }

    // Add price range filter
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseInt(minPrice);
      if (maxPrice) filter.price.$lte = parseInt(maxPrice);
    }

    // Add search filter
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const properties = await Property.find(filter)
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('owner', 'name email');

    // Get total count for pagination
    const total = await Property.countDocuments(filter);

    // Calculate stats
    const stats = await Property.aggregate([
      { $match: { owner: req.user._id } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const statsObj = {
      total: await Property.countDocuments({ owner: req.user._id }),
      available: 0,
      sold: 0,
      pending: 0
    };

    stats.forEach(stat => {
      statsObj[stat._id] = stat.count;
    });

    res.json({
      success: true,
      data: {
        properties,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total,
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        },
        stats: statsObj
      },
      message: 'Properties retrieved successfully'
    });
  } catch (error) {
    console.error('Get properties error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching properties'
    });
  }
});

// GET /api/v1/properties/:id - Get single property
router.get('/:id', auth, async (req, res) => {
  try {
    const property = await Property.findOne({
      _id: req.params.id,
      owner: req.user._id
    }).populate('owner', 'name email');

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    res.json({
      success: true,
      data: property,
      message: 'Property retrieved successfully'
    });
  } catch (error) {
    console.error('Get property error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid property ID'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while fetching property'
    });
  }
});

// POST /api/v1/properties - Create new property
router.post('/', auth, async (req, res) => {
  try {
    const {
      title,
      type,
      price,
      location,
      status = 'available',
      images = [],
      bedrooms = 0,
      bathrooms,
      area,
      description = '',
      features = []
    } = req.body;

    // Validation
    if (!title || !type || !price || !location || !bathrooms || !area) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: title, type, price, location, bathrooms, area'
      });
    }

    // Validate property type
    const validTypes = ['villa', 'apartment', 'house', 'commercial'];
    if (!validTypes.includes(type.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid property type. Must be: villa, apartment, house, or commercial'
      });
    }

    // Validate status
    const validStatuses = ['available', 'sold', 'pending'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be: available, sold, or pending'
      });
    }

    // Validate images array (max 3 images)
    if (images.length > 3) {
      return res.status(400).json({
        success: false,
        message: 'Maximum 3 images allowed'
      });
    }

    const property = new Property({
      title,
      type: type.toLowerCase(),
      price: Number(price),
      location,
      status,
      images,
      bedrooms: Number(bedrooms),
      bathrooms: Number(bathrooms),
      area: Number(area),
      description,
      features,
      owner: req.user._id
    });

    const savedProperty = await property.save();
    
    // Populate owner data for response
    await savedProperty.populate('owner', 'name email');

    res.status(201).json({
      success: true,
      data: savedProperty,
      message: 'Property created successfully'
    });
  } catch (error) {
    console.error('Create property error:', error);

    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while creating property'
    });
  }
});

// PUT /api/v1/properties/:id - Update property
router.put('/:id', auth, async (req, res) => {
  try {
    const {
      title,
      type,
      price,
      location,
      status,
      images,
      bedrooms,
      bathrooms,
      area,
      description,
      features
    } = req.body;

    // Find property and verify ownership
    const property = await Property.findOne({
      _id: req.params.id,
      owner: req.user._id
    });

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    // Validate type if provided
    if (type) {
      const validTypes = ['villa', 'apartment', 'house', 'commercial'];
      if (!validTypes.includes(type.toLowerCase())) {
        return res.status(400).json({
          success: false,
          message: 'Invalid property type'
        });
      }
    }

    // Validate status if provided
    if (status) {
      const validStatuses = ['available', 'sold', 'pending'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status'
        });
      }
    }

    // Validate images if provided
    if (images && images.length > 3) {
      return res.status(400).json({
        success: false,
        message: 'Maximum 3 images allowed'
      });
    }

    // Update fields
    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (type !== undefined) updateData.type = type.toLowerCase();
    if (price !== undefined) updateData.price = Number(price);
    if (location !== undefined) updateData.location = location;
    if (status !== undefined) updateData.status = status;
    if (images !== undefined) updateData.images = images;
    if (bedrooms !== undefined) updateData.bedrooms = Number(bedrooms);
    if (bathrooms !== undefined) updateData.bathrooms = Number(bathrooms);
    if (area !== undefined) updateData.area = Number(area);
    if (description !== undefined) updateData.description = description;
    if (features !== undefined) updateData.features = features;

    const updatedProperty = await Property.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('owner', 'name email');

    res.json({
      success: true,
      data: updatedProperty,
      message: 'Property updated successfully'
    });
  } catch (error) {
    console.error('Update property error:', error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid property ID'
      });
    }

    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while updating property'
    });
  }
});

// DELETE /api/v1/properties/:id - Delete property
router.delete('/:id', auth, async (req, res) => {
  try {
    const property = await Property.findOneAndDelete({
      _id: req.params.id,
      owner: req.user._id
    });

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    res.json({
      success: true,
      data: property,
      message: 'Property deleted successfully'
    });
  } catch (error) {
    console.error('Delete property error:', error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid property ID'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while deleting property'
    });
  }
});

// GET /api/v1/properties/stats/overview - Get property statistics
router.get('/stats/overview', auth, async (req, res) => {
  try {
    const userId = req.user._id;

    // Get basic stats
    const stats = await Property.aggregate([
      { $match: { owner: userId } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          totalValue: { $sum: '$price' },
          avgPrice: { $avg: '$price' },
          availableCount: {
            $sum: { $cond: [{ $eq: ['$status', 'available'] }, 1, 0] }
          },
          soldCount: {
            $sum: { $cond: [{ $eq: ['$status', 'sold'] }, 1, 0] }
          },
          pendingCount: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
          }
        }
      }
    ]);

    // Get type distribution
    const typeStats = await Property.aggregate([
      { $match: { owner: userId } },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          avgPrice: { $avg: '$price' }
        }
      }
    ]);

    const result = {
      overview: stats[0] || {
        total: 0,
        totalValue: 0,
        avgPrice: 0,
        availableCount: 0,
        soldCount: 0,
        pendingCount: 0
      },
      typeDistribution: typeStats
    };

    res.json({
      success: true,
      data: result,
      message: 'Property statistics retrieved successfully'
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching statistics'
    });
  }
});

module.exports = router;