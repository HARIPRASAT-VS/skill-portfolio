const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    imageUrl: {
      type: String,
    },
    category: {
      type: String,
      enum: ['Web', 'Mobile', 'AI/ML', 'IoT', 'Cloud', 'Desktop', 'Other'],
      required: true,
    },
    technologies: {
      type: [String],
      default: [],
    },
    role: {
      type: String,
    },
    teamSize: {
      type: Number,
      default: 1,
    },
    duration: {
      type: String,
    },
    githubUrl: {
      type: String,
    },
    liveUrl: {
      type: String,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    skills: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Skill',
      },
    ],
    isPublic: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Project', projectSchema);
