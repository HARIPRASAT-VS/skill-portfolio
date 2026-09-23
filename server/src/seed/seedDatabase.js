const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

// Load env vars
dotenv.config();

// Load models
const User = require('../models/User');
const Profile = require('../models/Profile');
const Skill = require('../models/Skill');
const Project = require('../models/Project');
const Certification = require('../models/Certification');
const Achievement = require('../models/Achievement');

// Connect to DB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/skillfolio');

const seedData = async () => {
  try {
    // Clear all existing data
    await User.deleteMany();
    await Profile.deleteMany();
    await Skill.deleteMany();
    await Project.deleteMany();
    await Certification.deleteMany();
    await Achievement.deleteMany();

    console.log('Data Cleared');

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('Demo@12345', salt);

    // Create User
    const user = await User.create({
      name: 'Hariprasat V.S.',
      username: 'hariprasat',
      email: 'demo@skillfolio.dev',
      password: hashedPassword, // explicitly hash as we are bypassing middleware if using create() in some cases, though pre-save should handle it. Passing literal to avoid issues.
      role: 'student',
    });

    // We explicitly overwrite the password again since pre('save') might double hash if we passed literal 'Demo@12345'.
    // Actually, User.create runs pre('save'). We should just pass the plaintext and let model handle it.
    await User.findByIdAndUpdate(user._id, { password: hashedPassword });

    const userId = user._id;

    // Create Profile
    await Profile.create({
      user: userId,
      fullName: 'Hariprasat V.S.',
      professionalTitle: 'Full Stack Developer',
      bio: 'Passionate computer science student and developer building impactful web applications.',
      phone: '+91 9876543210',
      location: 'Chennai, India',
      college: 'Anna University',
      degree: 'B.E. Computer Science',
      graduationYear: 2025,
      githubUrl: 'https://github.com/hariprasat',
      linkedinUrl: 'https://linkedin.com/in/hariprasat',
      portfolioUrl: 'https://hariprasat.dev',
      interests: ['Web Development', 'Open Source', 'UI/UX Design'],
      isPublic: true,
    });

    // Create Skills
    const skill1 = await Skill.create({ user: userId, name: 'React', category: 'Frontend', level: 'Advanced', yearsOfExperience: 3 });
    const skill2 = await Skill.create({ user: userId, name: 'Node.js', category: 'Backend', level: 'Intermediate', yearsOfExperience: 2 });
    const skill3 = await Skill.create({ user: userId, name: 'MongoDB', category: 'Database', level: 'Intermediate', yearsOfExperience: 2 });
    const skill4 = await Skill.create({ user: userId, name: 'TypeScript', category: 'Programming', level: 'Advanced', yearsOfExperience: 2 });
    const skill5 = await Skill.create({ user: userId, name: 'Tailwind CSS', category: 'Frontend', level: 'Expert', yearsOfExperience: 3 });

    // Create Projects
    const proj1 = await Project.create({
      user: userId,
      title: 'SkillFolio',
      description: 'A student portfolio and skill tracking platform.',
      category: 'Web',
      technologies: ['React', 'Node.js', 'MongoDB', 'Tailwind CSS'],
      githubUrl: 'https://github.com',
      liveUrl: 'https://skillfolio.dev',
      featured: true,
      skills: [skill1._id, skill2._id, skill3._id, skill5._id],
    });

    const proj2 = await Project.create({
      user: userId,
      title: 'GROUPS.BIT',
      description: 'A collaborative study group platform.',
      category: 'Web',
      technologies: ['React', 'Firebase', 'TypeScript'],
      githubUrl: 'https://github.com',
      featured: true,
      skills: [skill1._id, skill4._id],
    });

    // Update skills with projects
    await Skill.findByIdAndUpdate(skill1._id, { $push: { projects: { $each: [proj1._id, proj2._id] } } });
    await Skill.findByIdAndUpdate(skill2._id, { $push: { projects: proj1._id } });
    await Skill.findByIdAndUpdate(skill3._id, { $push: { projects: proj1._id } });
    await Skill.findByIdAndUpdate(skill4._id, { $push: { projects: proj2._id } });
    await Skill.findByIdAndUpdate(skill5._id, { $push: { projects: proj1._id } });

    // Create Certifications
    const cert1 = await Certification.create({
      user: userId,
      title: 'AWS Certified Cloud Practitioner',
      organization: 'Amazon Web Services',
      issueDate: new Date('2023-05-10'),
      skills: [],
    });

    // Create Achievements
    await Achievement.create({
      user: userId,
      title: '1st Place Hackathon',
      organization: 'TechFest 2024',
      date: new Date('2024-02-15'),
      category: 'Hackathon',
      description: 'Won first place for building an AI-powered accessibility tool.',
    });

    console.log('Data Imported - Hariprasat V.S. Profile Seeded Successfully');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

seedData();
