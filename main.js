"use strict"

// Third party modules
const bodyParser = require('body-parser')
const player = require('play-sound')()
const express = require('express')
const request = require('request-promise')
const Promise = require('bluebird')
// Custom modules
const actions = require('./js/actions')
const { playScene } = require('./js/scene')
const { getConfig, setConfig } = require('./js/config')

var config = getConfig()
const app = express()

Promise.config({ cancellation: true })

app.use(bodyParser.json())
app.use(express.static('assets'))

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html')
})

app.get('/config', (req, res) => {
  if (!config) {
    res.sendStatus(404)
    return
  }

  res.json(config)
})

app.post('/config', (req, res) => {
  config = setConfig(req.body)
  res.sendStatus(201)
})

app.post('/scene', (req, res) => {
  playScene(req.body)
  res.end()
})

app.listen(3000, () => {
  console.log('Example app listening on port 3000!')
})
