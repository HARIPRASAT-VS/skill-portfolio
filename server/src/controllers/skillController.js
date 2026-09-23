const Skill = require('../models/Skill');
const Project = require('../models/Project');
const Certification = require('../models/Certification');
const { logActivity } = require('../services/activityService');
// @desc    Get all skills for current user
// @route   GET /api/skills
// @access  Private
const getSkills = async (req, res) => {
  try {
    const { search, category, level } = req.query;
    
    let query = { user: req.user.id };
    
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }
    if (category) {
      query.category = category;
    }
    if (level) {
      query.level = level;
    }

    const skills = await Skill.find(query).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: skills });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single skill and its evidence
// @route   GET /api/skills/:id
// @access  Private
const getSkill = async (req, res) => {
  try {
    const skill = await Skill.findOne({ _id: req.params.id, user: req.user.id });

    if (!skill) {
      return res.status(404).json({ success: false, message: 'Skill not found' });
    }

    res.status(200).json({ success: true, data: skill });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get skill evidence (projects & certifications)
// @route   GET /api/skills/:id/evidence
// @access  Private
const getSkillEvidence = async (req, res) => {
  try {
    const skill = await Skill.findOne({ _id: req.params.id, user: req.user.id });

    if (!skill) {
      return res.status(404).json({ success: false, message: 'Skill not found' });
    }

    const projects = await Project.find({ user: req.user.id, skills: skill._id });
    const certifications = await Certification.find({ user: req.user.id, skills: skill._id });

    res.status(200).json({
      success: true,
      data: {
        skill,
        projects,
        certifications
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a skill
// @route   POST /api/skills
// @access  Private
const createSkill = async (req, res) => {
  try {
    const skillData = { ...req.body, user: req.user.id };
    const skill = await Skill.create(skillData);
    await logActivity(req.user.id, 'Added new skill', skill.name, 'primary');
    res.status(201).json({ success: true, data: skill });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update a skill
// @route   PUT /api/skills/:id
// @access  Private
const updateSkill = async (req, res) => {
  try {
    let skill = await Skill.findOne({ _id: req.params.id, user: req.user.id });

    if (!skill) {
      return res.status(404).json({ success: false, message: 'Skill not found' });
    }

    skill = await Skill.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    
    await logActivity(req.user.id, 'Updated skill', skill.name, 'secondary');

    res.status(200).json({ success: true, data: skill });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a skill
// @route   DELETE /api/skills/:id
// @access  Private
const deleteSkill = async (req, res) => {
  try {
    const skill = await Skill.findOne({ _id: req.params.id, user: req.user.id });

    if (!skill) {
      return res.status(404).json({ success: false, message: 'Skill not found' });
    }

    await skill.deleteOne();
    
    // Also remove this skill reference from all projects and certifications
    await Project.updateMany(
      { user: req.user.id, skills: skill._id },
      { $pull: { skills: skill._id } }
    );
    await Certification.updateMany(
      { user: req.user.id, skills: skill._id },
      { $pull: { skills: skill._id } }
    );

    await logActivity(req.user.id, 'Deleted skill', skill.name, 'amber');

    res.status(200).json({ success: true, message: 'Skill removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getSkills,
  getSkill,
  getSkillEvidence,
  createSkill,
  updateSkill,
  deleteSkill,
};
