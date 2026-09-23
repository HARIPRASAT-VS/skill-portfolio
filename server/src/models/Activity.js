const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    action: {
      type: String,
      required: true,
    },
    target: {
      type: String,
      required: true,
    },
    actionType: {
      type: String, // e.g., 'primary', 'secondary', 'accent', 'emerald', 'amber'
      default: 'primary'
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Activity', activitySchema);
