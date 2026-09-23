const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Profile = require('../models/Profile');
const Skill = require('../models/Skill');
const Project = require('../models/Project');
const Certification = require('../models/Certification');
const Achievement = require('../models/Achievement');

const seedData = async (req, res) => {
  try {
    // Clear all existing data
    await User.deleteMany();
    await Profile.deleteMany();
    await Skill.deleteMany();
    await Project.deleteMany();
    await Certification.deleteMany();
    await Achievement.deleteMany();

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('Demo@12345', salt);

    // Create User
    const user = await User.create({
      name: 'Hariprasat V.S.',
      username: 'hariprasat',
      email: 'hariprasat@student.com',
      password: hashedPassword,
      role: 'student',
    });

    await User.findByIdAndUpdate(user._id, { password: hashedPassword });
    const userId = user._id;

    // Create Profile
    await Profile.create({
      user: userId,
      fullName: 'Hariprasat V.S.',
      professionalTitle: 'Information Technology Student',
      bio: 'Passionate 3rd-year IT student building impactful web applications and solving real-world problems through technology.',
      phone: '+91 9876543210',
      location: 'Sathyamangalam, India',
      college: 'Bannari Amman Institute of Technology',
      degree: 'B.Tech',
      department: 'Information Technology',
      graduationYear: 2026,
      academicYear: '3rd Year',
      githubUrl: 'https://github.com/HARIPRASAT-VS',
      linkedinUrl: 'https://linkedin.com/in/hariprasat-vs',
      portfolioUrl: 'https://skill-portfolio-rouge.vercel.app',
      interests: ['Full Stack Development', 'Cloud Computing', 'UI/UX Design', 'AI/ML'],
      isPublic: true,
    });

    // Create Skills
    const skill1 = await Skill.create({ user: userId, name: 'React', category: 'Frontend', level: 'Advanced', yearsOfExperience: 2, progress: 90, isPublic: true });
    const skill2 = await Skill.create({ user: userId, name: 'Node.js', category: 'Backend', level: 'Intermediate', yearsOfExperience: 1, progress: 75, isPublic: true });
    const skill3 = await Skill.create({ user: userId, name: 'MongoDB', category: 'Database', level: 'Intermediate', yearsOfExperience: 1, progress: 80, isPublic: true });
    const skill4 = await Skill.create({ user: userId, name: 'TypeScript', category: 'Programming', level: 'Advanced', yearsOfExperience: 2, progress: 85, isPublic: true });
    const skill5 = await Skill.create({ user: userId, name: 'Tailwind CSS', category: 'Frontend', level: 'Expert', yearsOfExperience: 2, progress: 95, isPublic: true });
    const skill6 = await Skill.create({ user: userId, name: 'Java', category: 'Programming', level: 'Intermediate', yearsOfExperience: 3, progress: 70, isPublic: true });

    // Create Projects
    const proj1 = await Project.create({
      user: userId,
      title: 'SkillFolio',
      description: 'A premium student portfolio and skill tracking platform with dynamic MongoDB integration, interactive dashboards, and real-time analytics.',
      role: 'Full Stack Developer',
      category: 'Web',
      technologies: ['React', 'Node.js', 'MongoDB', 'Tailwind CSS', 'TypeScript'],
      githubUrl: 'https://github.com/HARIPRASAT-VS/skill-portfolio',
      liveUrl: 'https://skill-portfolio-rouge.vercel.app',
      featured: true,
      isPublic: true,
      image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80',
      relatedSkillIds: [skill1._id, skill2._id, skill3._id, skill4._id, skill5._id],
    });

    const proj2 = await Project.create({
      user: userId,
      title: 'EduConnect Platform',
      description: 'A collaborative study group platform connecting students across departments to share resources and solve problems collectively.',
      role: 'Frontend Lead',
      category: 'Web',
      technologies: ['React', 'Firebase', 'TypeScript', 'Tailwind CSS'],
      githubUrl: 'https://github.com/HARIPRASAT-VS',
      featured: true,
      isPublic: true,
      image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80',
      relatedSkillIds: [skill1._id, skill4._id, skill5._id],
    });

    // Create Certifications
    const cert1 = await Certification.create({
      user: userId,
      title: 'AWS Certified Cloud Practitioner',
      organization: 'Amazon Web Services',
      issueDate: 'May 2023',
      credentialUrl: 'https://aws.amazon.com',
      credentialId: 'AWS-12345678',
      isPublic: true,
      relatedSkillIds: [],
    });
    
    const cert2 = await Certification.create({
      user: userId,
      title: 'Full Stack Web Development Certification',
      organization: 'freeCodeCamp',
      issueDate: 'Jan 2024',
      credentialUrl: 'https://freecodecamp.org',
      isPublic: true,
      relatedSkillIds: [skill1._id, skill2._id],
    });

    // Create Achievements
    await Achievement.create({
      user: userId,
      title: '1st Place Hackathon',
      organization: 'BIT TechFest 2024',
      date: 'Feb 2024',
      category: 'Hackathon',
      description: 'Won first place for building an AI-powered accessibility tool during the college annual tech fest.',
      isPublic: true,
      relatedSkillIds: [skill1._id, skill2._id],
    });
    
    await Achievement.create({
      user: userId,
      title: 'Academic Excellence Award',
      organization: 'Bannari Amman Institute of Technology',
      date: 'Aug 2023',
      category: 'Academics',
      description: 'Maintained top 5% academic standing in the Information Technology department during the sophomore year.',
      isPublic: true,
      relatedSkillIds: [],
    });

    res.status(200).json({ success: true, message: 'Database seeded successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { seedData };
