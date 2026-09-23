const Project = require('../models/Project');
const Skill = require('../models/Skill');

// @desc    Get all projects for current user
// @route   GET /api/projects
// @access  Private
const getProjects = async (req, res) => {
  try {
    const { search, category, featured } = req.query;
    
    let query = { user: req.user.id };
    
    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }
    if (category) {
      query.category = category;
    }
    if (featured === 'true') {
      query.featured = true;
    }

    const projects = await Project.find(query)
      .populate('skills', 'name category level')
      .sort({ createdAt: -1 });
      
    res.status(200).json({ success: true, data: projects });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single project
// @route   GET /api/projects/:id
// @access  Private
const getProject = async (req, res) => {
  try {
    const project = await Project.findOne({ _id: req.params.id, user: req.user.id })
      .populate('skills', 'name category level');

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    res.status(200).json({ success: true, data: project });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a project
// @route   POST /api/projects
// @access  Private
const createProject = async (req, res) => {
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

    const projectData = { ...req.body, user: req.user.id };
    const project = await Project.create(projectData);
    
    // Add project reference to associated skills
    if (skills && skills.length > 0) {
      await Skill.updateMany(
        { _id: { $in: skills } },
        { $push: { projects: project._id } }
      );
    }

    res.status(201).json({ success: true, data: project });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update a project
// @route   PUT /api/projects/:id
// @access  Private
const updateProject = async (req, res) => {
  try {
    let project = await Project.findOne({ _id: req.params.id, user: req.user.id });

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const { skills } = req.body;
    const oldSkills = project.skills.map(id => id.toString());

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

    project = await Project.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('skills', 'name category level');

    // Update skill references if skills array was modified
    if (skills) {
      const newSkills = skills.map(id => id.toString());
      
      // Skills to remove project from
      const skillsToRemove = oldSkills.filter(id => !newSkills.includes(id));
      if (skillsToRemove.length > 0) {
        await Skill.updateMany(
          { _id: { $in: skillsToRemove } },
          { $pull: { projects: project._id } }
        );
      }
      
      // Skills to add project to
      const skillsToAdd = newSkills.filter(id => !oldSkills.includes(id));
      if (skillsToAdd.length > 0) {
        await Skill.updateMany(
          { _id: { $in: skillsToAdd } },
          { $push: { projects: project._id } }
        );
      }
    }

    res.status(200).json({ success: true, data: project });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a project
// @route   DELETE /api/projects/:id
// @access  Private
const deleteProject = async (req, res) => {
  try {
    const project = await Project.findOne({ _id: req.params.id, user: req.user.id });

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    await project.deleteOne();

    // Remove project reference from associated skills
    if (project.skills && project.skills.length > 0) {
      await Skill.updateMany(
        { _id: { $in: project.skills } },
        { $pull: { projects: project._id } }
      );
    }

    res.status(200).json({ success: true, message: 'Project removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
};
