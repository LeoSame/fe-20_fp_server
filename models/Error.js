const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ErrorSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    error: {
      type: String,
      required: true,
    },
    errorInfo: {
      type: Object,
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  { strict: false }
);

module.exports = Error = mongoose.model('error', ErrorSchema);
