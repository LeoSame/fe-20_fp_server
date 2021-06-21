const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ImageSchema = new Schema(
  {
    name: {
      type: String,
    },
    product: {
      type: String,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    affiliation: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  { strict: false }
);

module.exports = Image = mongoose.model('image', ImageSchema);
