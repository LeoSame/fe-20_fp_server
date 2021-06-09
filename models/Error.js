const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ErrorSchema = new Schema(
  {
    name: {
      type: String,
    },
    message: {
      type: String,
    },
    error: {
      type: Object,
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
