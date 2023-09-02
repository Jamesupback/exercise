const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const mongoose = require('mongoose')
const { users, exercise, log } = require('./schema')
mongoose.connect(process.env['URI'], { useNewUrlParser: true, useUnifiedTopology: true })
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.post('/api/users', async (req, res) => {
  const newuser = new users({
    username: req.body.username
  })
  await newuser.save().then((data) => {
    res.json({
      username: data.username,
      _id: data._id
    })
  })
});

app.get('/api/users', async (req, res) => {
  const allusers = await users.find({});
  res.json(allusers)
})

app.post('/api/users/:_id/exercises', async (req, res) => {
  const id=req.params._id
  const user=users.findById(id)
  console.log(user)
  const newexercise = new exercise({
    _id: req.params._id,
    description: req.body.description,
    duration: req.body.duration,
    date:req.body.date
    })
  await newexercise.save().then((data) => {
    res.json({
      _id: data._id,
      description: data.description,
      duration: data.duration,
      date: data.date.toDateString()
    })
  })
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
