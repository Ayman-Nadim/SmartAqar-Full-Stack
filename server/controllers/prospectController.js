const Prospect = require('../models/Prospect');
const { validationResult } = require('express-validator');

class ProspectController {
  // Obtenir tous les prospects avec filtres et pagination
  async getAllProspects(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        status,
        source,
        priority,
        propertyType,
        location,
        budgetMin,
        budgetMax,
        sortBy = 'addedDate',
        sortOrder = 'desc'
      } = req.query;

      // Construire la requête
      let query = { owner: req.user._id, isActive: true };

      // Appliquer les filtres
      if (status) query.status = status;
      if (source) query.source = source;
      if (priority) query.priority = priority;
      if (propertyType) query['preferences.propertyTypes'] = propertyType;
      if (location) query['preferences.locations'] = { $regex: location, $options: 'i' };
      
      if (budgetMin || budgetMax) {
        if (budgetMin) query['preferences.budget.min'] = { $gte: parseInt(budgetMin) };
        if (budgetMax) query['preferences.budget.max'] = { $lte: parseInt(budgetMax) };
      }

      // Recherche textuelle
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { phone: { $regex: search, $options: 'i' } },
          { notes: { $regex: search, $options: 'i' } },
          { 'preferences.locations': { $regex: search, $options: 'i' } }
        ];
      }

      // Configuration du tri
      const sortOptions = {};
      sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

      // Pagination
      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const skip = (pageNum - 1) * limitNum;

      // Exécuter la requête avec aggregation pour de meilleures performances
      const aggregationPipeline = [
        { $match: query },
        { $sort: sortOptions },
        {
          $facet: {
            prospects: [
              { $skip: skip },
              { $limit: limitNum },
              {
                $lookup: {
                  from: 'properties',
                  localField: 'matchedProperties',
                  foreignField: '_id',
                  as: 'matchedProperties',
                  pipeline: [
                    { $project: { title: 1, price: 1, location: 1, type: 1 } }
                  ]
                }
              }
            ],
            totalCount: [{ $count: 'count' }]
          }
        }
      ];

      const result = await Prospect.aggregate(aggregationPipeline);
      const prospects = result[0].prospects;
      const total = result[0].totalCount[0]?.count || 0;
      const totalPages = Math.ceil(total / limitNum);

      return res.json({
        success: true,
        data: {
          prospects,
          pagination: {
            currentPage: pageNum,
            totalPages,
            totalItems: total,
            itemsPerPage: limitNum,
            hasNextPage: pageNum < totalPages,
            hasPrevPage: pageNum > 1
          }
        },
        message: 'Prospects retrieved successfully'
      });

    } catch (error) {
      console.error('Error in getAllProspects:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error while fetching prospects',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Obtenir les statistiques des prospects
  async getProspectStats(req, res) {
    try {
      const userId = req.user._id;

      const stats = await Prospect.aggregate([
        { $match: { owner: userId, isActive: true } },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            hot: { $sum: { $cond: [{ $eq: ['$status', 'hot'] }, 1, 0] } },
            warm: { $sum: { $cond: [{ $eq: ['$status', 'warm'] }, 1, 0] } },
            cold: { $sum: { $cond: [{ $eq: ['$status', 'cold'] }, 1, 0] } },
            active: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
            converted: { $sum: { $cond: [{ $eq: ['$status', 'converted'] }, 1, 0] } },
            withMatches: { $sum: { $cond: [{ $gt: [{ $size: '$matchedProperties' }, 0] }, 1, 0] } },
            avgBudgetMin: { $avg: '$preferences.budget.min' },
            avgBudgetMax: { $avg: '$preferences.budget.max' }
          }
        }
      ]);

      // Statistiques par source
      const sourceStats = await Prospect.aggregate([
        { $match: { owner: userId, isActive: true } },
        {
          $group: {
            _id: '$source',
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } }
      ]);

      // Prospects ajoutés récemment (7 derniers jours)
      const recentProspects = await Prospect.countDocuments({
        owner: userId,
        isActive: true,
        addedDate: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
      });

      // Prospects nécessitant un suivi (plus de 30 jours sans contact)
      const staleProspects = await Prospect.countDocuments({
        owner: userId,
        isActive: true,
        lastContact: { $lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
      });

      const defaultStats = {
        total: 0,
        hot: 0,
        warm: 0,
        cold: 0,
        active: 0,
        converted: 0,
        withMatches: 0,
        avgBudgetMin: 0,
        avgBudgetMax: 0
      };

      const result = {
        ...(stats.length > 0 ? stats[0] : defaultStats),
        sourceBreakdown: sourceStats,
        recentProspects,
        staleProspects
      };

      return res.json({
        success: true,
        data: result,
        message: 'Statistics retrieved successfully'
      });

    } catch (error) {
      console.error('Error in getProspectStats:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error while fetching statistics',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Obtenir un prospect spécifique
  async getProspectById(req, res) {
    try {
      const prospect = await Prospect.findOne({
        _id: req.params.id,
        owner: req.user._id,
        isActive: true
      })
      .populate('matchedProperties')
      .populate('interactions.createdBy', 'name email');

      if (!prospect) {
        return res.status(404).json({
          success: false,
          message: 'Prospect not found'
        });
      }

      return res.json({
        success: true,
        data: prospect,
        message: 'Prospect retrieved successfully'
      });

    } catch (error) {
      console.error('Error in getProspectById:', error);
      if (error.name === 'CastError') {
        return res.status(400).json({
          success: false,
          message: 'Invalid prospect ID'
        });
      }
      return res.status(500).json({
        success: false,
        message: 'Server error while fetching prospect',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Créer un nouveau prospect
  async createProspect(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      // Vérifier si l'email existe déjà
      const existingProspect = await Prospect.findOne({
        owner: req.user._id,
        email: req.body.email,
        isActive: true
      });

      if (existingProspect) {
        return res.status(409).json({
          success: false,
          message: 'A prospect with this email already exists'
        });
      }

      // Créer le prospect
      const prospectData = {
        ...req.body,
        owner: req.user._id
      };

      const prospect = new Prospect(prospectData);
      await prospect.save();

      return res.status(201).json({
        success: true,
        data: prospect,
        message: 'Prospect created successfully'
      });

    } catch (error) {
      console.error('Error in createProspect:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error while creating prospect',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Mettre à jour un prospect
  async updateProspect(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      const prospect = await Prospect.findOne({
        _id: req.params.id,
        owner: req.user._id,
        isActive: true
      });

      if (!prospect) {
        return res.status(404).json({
          success: false,
          message: 'Prospect not found'
        });
      }

      // Vérifier si l'email existe déjà pour un autre prospect
      if (req.body.email && req.body.email !== prospect.email) {
        const existingProspect = await Prospect.findOne({
          owner: req.user._id,
          email: req.body.email,
          isActive: true,
          _id: { $ne: req.params.id }
        });

        if (existingProspect) {
          return res.status(409).json({
            success: false,
            message: 'A prospect with this email already exists'
          });
        }
      }

      // Mettre à jour le prospect
      Object.assign(prospect, req.body);
      await prospect.save();

      return res.json({
        success: true,
        data: prospect,
        message: 'Prospect updated successfully'
      });

    } catch (error) {
      console.error('Error in updateProspect:', error);
      if (error.name === 'CastError') {
        return res.status(400).json({
          success: false,
          message: 'Invalid prospect ID'
        });
      }
      return res.status(500).json({
        success: false,
        message: 'Server error while updating prospect',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Supprimer un prospect (soft delete)
  async deleteProspect(req, res) {
    try {
      const prospect = await Prospect.findOne({
        _id: req.params.id,
        owner: req.user._id,
        isActive: true
      });

      if (!prospect) {
        return res.status(404).json({
          success: false,
          message: 'Prospect not found'
        });
      }

      // Soft delete
      prospect.isActive = false;
      await prospect.save();

      return res.json({
        success: true,
        message: 'Prospect deleted successfully'
      });

    } catch (error) {
      console.error('Error in deleteProspect:', error);
      if (error.name === 'CastError') {
        return res.status(400).json({
          success: false,
          message: 'Invalid prospect ID'
        });
      }
      return res.status(500).json({
        success: false,
        message: 'Server error while deleting prospect',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Ajouter une interaction
  async addInteraction(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      const prospect = await Prospect.findOne({
        _id: req.params.id,
        owner: req.user._id,
        isActive: true
      });

      if (!prospect) {
        return res.status(404).json({
          success: false,
          message: 'Prospect not found'
        });
      }

      const interaction = {
        type: req.body.type,
        description: req.body.description,
        createdBy: req.user._id
      };

      await prospect.addInteraction(interaction);

      return res.json({
        success: true,
        data: prospect,
        message: 'Interaction added successfully'
      });

    } catch (error) {
      console.error('Error in addInteraction:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error while adding interaction',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Mettre à jour le statut
  async updateStatus(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      const prospect = await Prospect.findOne({
        _id: req.params.id,
        owner: req.user._id,
        isActive: true
      });

      if (!prospect) {
        return res.status(404).json({
          success: false,
          message: 'Prospect not found'
        });
      }

      await prospect.updateStatus(req.body.status);

      return res.json({
        success: true,
        data: prospect,
        message: 'Status updated successfully'
      });

    } catch (error) {
      console.error('Error in updateStatus:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error while updating status',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Programmer la prochaine action
  async scheduleNextAction(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      const prospect = await Prospect.findOne({
        _id: req.params.id,
        owner: req.user._id,
        isActive: true
      });

      if (!prospect) {
        return res.status(404).json({
          success: false,
          message: 'Prospect not found'
        });
      }

      const actionData = {
        type: req.body.type,
        description: req.body.description || '',
        scheduledDate: new Date(req.body.scheduledDate)
      };

      await prospect.scheduleNextAction(actionData);

      return res.json({
        success: true,
        data: prospect,
        message: 'Next action scheduled successfully'
      });

    } catch (error) {
      console.error('Error in scheduleNextAction:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error while scheduling next action',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Obtenir les prospects avec actions en retard
  async getOverdueActions(req, res) {
    try {
      const prospects = await Prospect.find({
        owner: req.user._id,
        isActive: true,
        'nextAction.scheduledDate': { $lt: new Date() },
        'nextAction.completed': false
      }).select('name email nextAction status priority');

      return res.json({
        success: true,
        data: prospects,
        message: 'Overdue actions retrieved successfully'
      });

    } catch (error) {
      console.error('Error in getOverdueActions:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error while fetching overdue actions',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Recherche avancée de prospects
  async advancedSearch(req, res) {
    try {
      const {
        name,
        email,
        phone,
        status,
        source,
        priority,
        propertyTypes,
        locations,
        budgetMin,
        budgetMax,
        bedroomsMin,
        bedroomsMax,
        bathroomsMin,
        bathroomsMax,
        areaMin,
        areaMax,
        features,
        addedDateFrom,
        addedDateTo,
        lastContactFrom,
        lastContactTo,
        hasMatches,
        isStale
      } = req.body;

      let query = { owner: req.user._id, isActive: true };

      // Construire la requête dynamiquement
      if (name) query.name = { $regex: name, $options: 'i' };
      if (email) query.email = { $regex: email, $options: 'i' };
      if (phone) query.phone = { $regex: phone, $options: 'i' };
      if (status) query.status = { $in: Array.isArray(status) ? status : [status] };
      if (source) query.source = { $in: Array.isArray(source) ? source : [source] };
      if (priority) query.priority = { $in: Array.isArray(priority) ? priority : [priority] };

      // Filtres sur les préférences
      if (propertyTypes) {
        query['preferences.propertyTypes'] = { 
          $in: Array.isArray(propertyTypes) ? propertyTypes : [propertyTypes] 
        };
      }

      if (locations) {
        query['preferences.locations'] = { 
          $in: Array.isArray(locations) ? locations : [locations] 
        };
      }

      if (budgetMin !== undefined) query['preferences.budget.min'] = { $gte: budgetMin };
      if (budgetMax !== undefined) query['preferences.budget.max'] = { $lte: budgetMax };

      if (bedroomsMin !== undefined) query['preferences.bedrooms'] = { $gte: bedroomsMin };
      if (bedroomsMax !== undefined) {
        query['preferences.bedrooms'] = { 
          ...query['preferences.bedrooms'], 
          $lte: bedroomsMax 
        };
      }

      if (bathroomsMin !== undefined) query['preferences.bathrooms'] = { $gte: bathroomsMin };
      if (bathroomsMax !== undefined) {
        query['preferences.bathrooms'] = { 
          ...query['preferences.bathrooms'], 
          $lte: bathroomsMax 
        };
      }

      if (areaMin !== undefined) query['preferences.area.min'] = { $gte: areaMin };
      if (areaMax !== undefined) query['preferences.area.max'] = { $lte: areaMax };

      if (features) {
        query['preferences.features'] = { 
          $in: Array.isArray(features) ? features : [features] 
        };
      }

      // Filtres de date
      if (addedDateFrom || addedDateTo) {
        query.addedDate = {};
        if (addedDateFrom) query.addedDate.$gte = new Date(addedDateFrom);
        if (addedDateTo) query.addedDate.$lte = new Date(addedDateTo);
      }

      if (lastContactFrom || lastContactTo) {
        query.lastContact = {};
        if (lastContactFrom) query.lastContact.$gte = new Date(lastContactFrom);
        if (lastContactTo) query.lastContact.$lte = new Date(lastContactTo);
      }

      // Filtres spéciaux
      if (hasMatches !== undefined) {
        if (hasMatches) {
          query.matchedProperties = { $exists: true, $not: { $size: 0 } };
        } else {
          query.matchedProperties = { $size: 0 };
        }
      }

      if (isStale) {
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        query.lastContact = { $lt: thirtyDaysAgo };
      }

      const prospects = await Prospect.find(query)
        .populate('matchedProperties', 'title price location type')
        .sort({ addedDate: -1 });

      return res.json({
        success: true,
        data: prospects,
        message: 'Advanced search completed successfully'
      });

    } catch (error) {
      console.error('Error in advancedSearch:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error while performing advanced search',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}

module.exports = new ProspectController();