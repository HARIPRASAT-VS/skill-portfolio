const express = require('express');
const router = express.Router();
const {
  getCertifications,
  getCertification,
  createCertification,
  updateCertification,
  deleteCertification,
} = require('../controllers/certificationController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getCertifications)
  .post(protect, createCertification);

router.route('/:id')
  .get(protect, getCertification)
  .put(protect, updateCertification)
  .delete(protect, deleteCertification);

module.exports = router;
