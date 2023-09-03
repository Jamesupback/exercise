const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const mongoose = require('mongoose')
const { users, exercise, log } = require('./schema')
mongoose.connect(process.env['URI'])
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
  const idpara = req.params._id
  if (!req.body.date)
    req.body.date = new Date()
  await users.findById(idpara).then(async (data) => {
    if (!data)
      res.json("you can't send this you cocksucker")
    else {
      const exercises = new exercise({
        id: data._id,
        username: data.username,
        duration: req.body.duration,
        description: req.body.description,
        date: req.body.date
      })

      exercises.save().then((save) => {
        res.json({
          username: data.username,
          description: save.description,
          duration: save.duration,
          date: new Date(save.date).toDateString(),
          _id: data._id
        })
      }).catch((err) => console.log(err))

      await log.findOne({ id: idpara }).then(async (loginfo) => {
        const logdeets = {
          description: req.body.description,
          duration: req.body.duration,
          date: req.body.date
        }
        if (!loginfo) {
          const logs = new log({
            username: data.username,
            count: 1,
            id: data._id,
            log: []
          })
          logs.log.push(logdeets)
          logs.save().catch((err) => console.log(err))
        }

        else {
          await log.findOneAndUpdate({ id: idpara }, {
            $set: { count: loginfo.count + 1 },
            $push: { log: logdeets }
          })
        }
      }).catch((err) => console.log(err))
    }
  }).catch((err) => console.log(err))
})

app.get('/api/users/:_id/logs', async (req, res) => {
  const { from, to, limit } = req.query
  function parsedate(data) {
    const newarr = []
    data.map((e) => {
      const newobj = {
        "description": e.description,
        "duration": e.duration,
        "date": (e.date).toDateString()
      }
      newarr.push(newobj)
    })
    return newarr

  }
  let ifoundyou;
  if (from || to || limit) {
    const filter = {
      id: req.params._id
    }
    let dates = {};
    if (to)
      dates['$lte'] = new Date(to)
    if (from)
      dates['$gte'] = new Date(from)
    if (from || to)
      filter.date = dates

    await exercise.find(filter).limit(+limit ?? 100).then((result) => {
      const mylogs = result.map((e) => ({
        description: e.description,
        duration: e.duration,
        date: e.date.toDateString()
      }))
      ifoundyou = ({
        username: result[0].username,
        count: result.length,
        _id: result[0].id,
        log: mylogs
      })

    }).catch((err) => console.log(err))
  }
  else {
    await log.findOne({ id: req.params._id }).then((result) => {
      ifoundyou = ({
        username: result.username,
        count: result.count,
        _id: result.id,
        log: parsedate(result.log)
      })
    }).catch((err) => console.log(err))
  }
  res.json(ifoundyou)
})
const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
