const express = require('express');
const router = express.Router();
const Prospect = require('../models/Prospect');
const auth = require('../middleware/auth');

// Get all prospects of the logged-in user
router.get('/', auth, async (req, res) => {
  try {
    const prospects = await Prospect.find({ userId: req.user._id });
    res.json({ success: true, data: prospects });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get single prospect
router.get('/:id', auth, async (req, res) => {
  try {
    const prospect = await Prospect.findOne({ _id: req.params.id, userId: req.user._id });
    if (!prospect) return res.status(404).json({ message: 'Prospect not found' });
    res.json({ success: true, data: prospect });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Add new prospect
router.post('/', auth, async (req, res) => {
  try {
    const newProspect = new Prospect({ ...req.body, userId: req.user._id });
    await newProspect.save();
    res.json({ success: true, data: newProspect });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// Update prospect
router.put('/:id', auth, async (req, res) => {
  try {
    const prospect = await Prospect.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true }
    );
    if (!prospect) return res.status(404).json({ message: 'Prospect not found' });
    res.json({ success: true, data: prospect });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// Delete prospect
router.delete('/:id', auth, async (req, res) => {
  try {
    const prospect = await Prospect.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!prospect) return res.status(404).json({ message: 'Prospect not found' });
    res.json({ success: true, message: 'Prospect deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
