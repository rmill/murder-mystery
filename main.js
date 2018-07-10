"use strict"

// Third party modules
const bodyParser = require('body-parser')
const express = require('express')
// Custom modules
const actions = require('./js/actions')
const discover = require('./js/discover')
const { playScene } = require('./js/scene')
const { createConfig, getConfig, saveConfig } = require('./js/config')

var config = getConfig()
const app = express()

app.use(bodyParser.json())
app.use(express.static('assets'))

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html')
})

app.get('/config', (req, res) => {
  if (!config) {
    return res.sendStatus(404)
  }

  res.json(config)
})

app.post('/configure', (req, res) => {
  discover().then((bridges) => {
    config = createConfig(bridges)
    saveConfig(config)
    res.json(config)
  }).catch(() => {
    res.sendStatus(500)
  });
})

app.post('/config/groups', (req, res) => {
  config.groups = req.body
  saveConfig(config)
  res.sendStatus(201)
})

app.post('/scene', (req, res) => {
  playScene(req.body)
  res.end()
})

app.listen(3000, () => {
  console.log('Example app listening on port 3000!')
})
