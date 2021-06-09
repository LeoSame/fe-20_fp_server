const express = require('express');
const router = express.Router();
const passport = require('passport'); // multer for parsing multipart form data (files)

//Import controllers
const { addError, deleteError, getErrors } = require('../controllers/error');

// @route   POST /brands
// @desc    Create new brand
// @access  Private
router.post('/', addError);

// @route   DELETE /brands/:id
// @desc    DELETE existing brand
// @access  Private
router.delete('/:id', passport.authenticate('jwt-admin', { session: false }), deleteError);

// @route   GET /brands
// @desc    GET existing brand
// @access  Public
router.get('/', passport.authenticate('jwt-admin', { session: false }), getErrors);

module.exports = router;
