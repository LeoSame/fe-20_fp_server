const express = require('express');
const router = express.Router();
const passport = require('passport'); // multer for parsing multipart form data (files)

//Import controllers
const { addImage, updateImage, deleteImage, getImage, getImageAffiliation } = require('../controllers/images');

// @route   POST /images
// @desc    Create new images
// @access  Public
router.post('/', addImage);

// @route   PUT /images/:name
// @desc    Update existing images
// @access  Private
router.put('/:name', passport.authenticate('jwt-admin', { session: false }), updateImage);

// @route   DELETE /images/:name
// @desc    DELETE existing images
// @access  Public
router.delete('/:name', deleteImage);

// @route   GET /images
// @desc    GET existing images
// @access  Private
router.get('/affiliation', passport.authenticate('jwt-admin', { session: false }), getImageAffiliation);

// @route   GET /images
// @desc    GET existing images
// @access  Private
router.get('/', passport.authenticate('jwt-admin', { session: false }), getImage);

module.exports = router;
