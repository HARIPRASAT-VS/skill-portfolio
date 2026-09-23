const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    fullName: {
      type: String,
    },
    professionalTitle: {
      type: String,
    },
    bio: {
      type: String,
    },
    phone: {
      type: String,
    },
    location: {
      type: String,
    },
    college: {
      type: String,
    },
    degree: {
      type: String,
    },
    department: {
      type: String,
    },
    graduationYear: {
      type: Number,
    },
    profileImage: {
      type: String,
    },
    resumeUrl: {
      type: String,
    },
    githubUrl: {
      type: String,
    },
    linkedinUrl: {
      type: String,
    },
    portfolioUrl: {
      type: String,
    },
    interests: {
      type: [String],
      default: [],
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Profile', profileSchema);
