const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: [
        'Programming',
        'Frontend',
        'Backend',
        'Database',
        'Cloud',
        'DevOps',
        'AI/ML',
        'Tools',
        'Soft Skills',
        'Other',
      ],
      required: true,
    },
    level: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
      required: true,
    },
    yearsOfExperience: {
      type: Number,
      default: 0,
    },
    description: {
      type: String,
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
    projects: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
      },
    ],
    certifications: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Certification',
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Skill', skillSchema);
