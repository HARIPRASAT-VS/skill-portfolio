const Certification = require('../models/Certification');
const Skill = require('../models/Skill');
const { logActivity } = require('../services/activityService');
// @desc    Get all certifications for current user
// @route   GET /api/certifications
// @access  Private
const getCertifications = async (req, res) => {
  try {
    const certifications = await Certification.find({ user: req.user.id })
      .populate('skills', 'name category level')
      .sort({ issueDate: -1 });
      
    res.status(200).json({ success: true, data: certifications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single certification
// @route   GET /api/certifications/:id
// @access  Private
const getCertification = async (req, res) => {
  try {
    const certification = await Certification.findOne({ _id: req.params.id, user: req.user.id })
      .populate('skills', 'name category level');

    if (!certification) {
      return res.status(404).json({ success: false, message: 'Certification not found' });
    }

    res.status(200).json({ success: true, data: certification });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a certification
// @route   POST /api/certifications
// @access  Private
const createCertification = async (req, res) => {
  try {
    const { skills } = req.body;

    // Validate skills belong to the user if any are provided
    if (skills && skills.length > 0) {
      const userSkills = await Skill.find({ _id: { $in: skills }, user: req.user.id });
      if (userSkills.length !== skills.length) {
        return res.status(400).json({ 
          success: false, 
          message: 'One or more skills do not belong to the user or do not exist' 
        });
      }
    }

    const certificationData = { ...req.body, user: req.user.id };
    const certification = await Certification.create(certificationData);
    
    // Add certification reference to associated skills
    if (skills && skills.length > 0) {
      await Skill.updateMany(
        { _id: { $in: skills } },
        { $push: { certifications: certification._id } }
      );
    }

    await logActivity(req.user.id, 'Added certification', certification.title, 'emerald');

    res.status(201).json({ success: true, data: certification });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update a certification
// @route   PUT /api/certifications/:id
// @access  Private
const updateCertification = async (req, res) => {
  try {
    let certification = await Certification.findOne({ _id: req.params.id, user: req.user.id });

    if (!certification) {
      return res.status(404).json({ success: false, message: 'Certification not found' });
    }

    const { skills } = req.body;
    const oldSkills = certification.skills.map(id => id.toString());

    // Validate new skills if provided
    if (skills) {
      const userSkills = await Skill.find({ _id: { $in: skills }, user: req.user.id });
      if (userSkills.length !== skills.length) {
        return res.status(400).json({ 
          success: false, 
          message: 'One or more skills do not belong to the user or do not exist' 
        });
      }
    }

    certification = await Certification.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('skills', 'name category level');

    // Update skill references if skills array was modified
    if (skills) {
      const newSkills = skills.map(id => id.toString());
      
      // Skills to remove certification from
      const skillsToRemove = oldSkills.filter(id => !newSkills.includes(id));
      if (skillsToRemove.length > 0) {
        await Skill.updateMany(
          { _id: { $in: skillsToRemove } },
          { $pull: { certifications: certification._id } }
        );
      }
      
      // Skills to add certification to
      const skillsToAdd = newSkills.filter(id => !oldSkills.includes(id));
      if (skillsToAdd.length > 0) {
        await Skill.updateMany(
          { _id: { $in: skillsToAdd } },
          { $push: { certifications: certification._id } }
        );
      }
    }

    await logActivity(req.user.id, 'Updated certification', certification.title, 'secondary');

    res.status(200).json({ success: true, data: certification });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a certification
// @route   DELETE /api/certifications/:id
// @access  Private
const deleteCertification = async (req, res) => {
  try {
    const certification = await Certification.findOne({ _id: req.params.id, user: req.user.id });

    if (!certification) {
      return res.status(404).json({ success: false, message: 'Certification not found' });
    }

    await certification.deleteOne();

    // Remove certification reference from associated skills
    if (certification.skills && certification.skills.length > 0) {
      await Skill.updateMany(
        { _id: { $in: certification.skills } },
        { $pull: { certifications: certification._id } }
      );
    }

    await logActivity(req.user.id, 'Deleted certification', certification.title, 'amber');

    res.status(200).json({ success: true, message: 'Certification removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getCertifications,
  getCertification,
  createCertification,
  updateCertification,
  deleteCertification,
};
