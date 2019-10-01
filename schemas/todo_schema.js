const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Model = mongoose.model;

const todoSchema = new Schema({
  input: {
    type: String,
    required: true,
    trim: true,
    minLength: 1,
    maxLength: 150
  }
});

const Todo = Model("todo", todoSchema);

module.exports = Todo;