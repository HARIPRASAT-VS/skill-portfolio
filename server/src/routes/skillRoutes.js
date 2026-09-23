const express = require('express');
const router = express.Router();
const {
  getSkills,
  getSkill,
  getSkillEvidence,
  createSkill,
  updateSkill,
  deleteSkill,
} = require('../controllers/skillController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getSkills)
  .post(protect, createSkill);

router.route('/:id')
  .get(protect, getSkill)
  .put(protect, updateSkill)
  .delete(protect, deleteSkill);

router.route('/:id/evidence')
  .get(protect, getSkillEvidence);

module.exports = router;
