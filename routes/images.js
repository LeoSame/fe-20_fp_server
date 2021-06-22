const express = require('express');
const router = express.Router();
const passport = require('passport'); // multer for parsing multipart form data (files)

//Import controllers
const { addImage, updateImage, deleteImage, getImage } = require('../controllers/images');

// @route   POST /brands
// @desc    Create new brand
// @access  Private
router.post('/', addImage);

// @route   PUT /brands/:id
// @desc    Update existing brand
// @access  Private
router.put('/:name', updateImage);

// @route   DELETE /brands/:id
// @desc    DELETE existing brand
// @access  Private
router.delete('/:name', deleteImage);

// @route   GET /brands
// @desc    GET existing brand
// @access  Public
router.get('/', getImage);

module.exports = router;
