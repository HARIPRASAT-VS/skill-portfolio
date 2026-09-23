const Activity = require('../models/Activity');

const logActivity = async (userId, action, target, actionType = 'primary') => {
  try {
    await Activity.create({
      user: userId,
      action,
      target,
      actionType
    });
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
};

module.exports = {
  logActivity
};
