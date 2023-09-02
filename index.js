const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const mongoose = require('mongoose')
const { users, exercise, log } = require('./schema')
mongoose.connect("mongodb://localhost:27017/freecodetest")
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
  if(!req.body.date)
  req.body.date=new Date()
  await users.findById(id).then((data)=>{
    if(!data)
    res.json("you can't send this you cocksucker")
    else{
      const exercises=new exercise({
        id:req.params._id,
        username:data.username,
        duration:req.body.duration,
        description:req.body.description,
        date:req.body.date
      })

      exercises.save().then((data)=>{
        res.json({
          _id:data._id,
          username:data.username,
          duration:data.duration,
          description:data.description,
          date:data.date.toDateString()
        })
      })
    }
  })
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
