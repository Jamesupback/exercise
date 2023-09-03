const mongoose = require('mongoose')
const userschema = new mongoose.Schema({
  username: String
})
const exerciseschema = new mongoose.Schema({
  id:{
    type:mongoose.SchemaTypes.ObjectId,
    ref:'users'
  },
  username: String,
  description: String,
  duration: Number,
  date:Date
})
const logschema = new mongoose.Schema({
  id:{
    type:mongoose.SchemaTypes.ObjectId,
    ref:'users'
  },
  username: String,
  count: Number,
  log: [{
    description: String,
    duration: Number,
    date: Date,
  }]
})

module.exports = {
  users: mongoose.model('users', userschema),
  exercise: mongoose.model('exercises', exerciseschema),
  log: mongoose.model('log', logschema)
}