"use strict"

// Third party modules
const bodyParser = require('body-parser');
const player = require('play-sound')()
const express = require('express')
const request = require('request-promise')
const Promise = require('bluebird')
// Custom modules
const actions = require('./js/actions');

const app = express()

Promise.config({ cancellation: true })

app.use(bodyParser.json());
app.use(express.static('assets'))

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html')
})

app.post('/scene', (req, res) => {
  playScene(req.body)
  res.end()
})

app.listen(3000, () => {
  console.log('Example app listening on port 3000!')
})

const groups = {
  all: [
    'http://192.168.0.38/api/EjvbqqttJW3PQ-REaCxk-m49GT1uQtbPdI19w78r/lights/4/state',
    'http://192.168.0.38/api/EjvbqqttJW3PQ-REaCxk-m49GT1uQtbPdI19w78r/lights/6/state',
    'http://192.168.0.144/api/NoGjUV9s9G5Ku0ifnGB3WGgdKFTSSnEbr9MsVgs-z/lights/3/state',
    'http://192.168.0.38/api/EjvbqqttJW3PQ-REaCxk-m49GT1uQtbPdI19w78r/lights/5/state',
    'http://192.168.0.136/api/G5T2UX0u3kFUNjlzNBDMsTQhmq7xhCklm7wj4odu/lights/1/state',
    'http://192.168.0.136/api/G5T2UX0u3kFUNjlzNBDMsTQhmq7xhCklm7wj4odu/lights/5/state',
    'http://192.168.0.203/api/KumTJJPCHNrw9PRhRemzY-TgWIVsGD-yRmWRkopd/lights/2/state',
    'http://192.168.0.144/api/NoGjUV9s9G5Ku0ifnGB3WGgdKFTSSnEbr9MsVgs-z/lights/1/state',
    'http://192.168.0.144/api/NoGjUV9s9G5Ku0ifnGB3WGgdKFTSSnEbr9MsVgs-z/lights/2/state',
    'http://192.168.0.203/api/KumTJJPCHNrw9PRhRemzY-TgWIVsGD-yRmWRkopd/lights/3/state'
  ],
  living_room: [
    'http://192.168.0.38/api/EjvbqqttJW3PQ-REaCxk-m49GT1uQtbPdI19w78r/lights/4/state',
    'http://192.168.0.38/api/EjvbqqttJW3PQ-REaCxk-m49GT1uQtbPdI19w78r/lights/6/state',
    'http://192.168.0.144/api/NoGjUV9s9G5Ku0ifnGB3WGgdKFTSSnEbr9MsVgs-z/lights/3/state'
  ],
  hallway: [
    'http://192.168.0.38/api/EjvbqqttJW3PQ-REaCxk-m49GT1uQtbPdI19w78r/lights/5/state',
    'http://192.168.0.136/api/G5T2UX0u3kFUNjlzNBDMsTQhmq7xhCklm7wj4odu/lights/1/state',
    'http://192.168.0.136/api/G5T2UX0u3kFUNjlzNBDMsTQhmq7xhCklm7wj4odu/lights/5/state'
  ],
  party: [
    'http://192.168.0.136/api/G5T2UX0u3kFUNjlzNBDMsTQhmq7xhCklm7wj4odu/lights/2/state',
    'http://192.168.0.136/api/G5T2UX0u3kFUNjlzNBDMsTQhmq7xhCklm7wj4odu/lights/3/state',
    'http://192.168.0.136/api/G5T2UX0u3kFUNjlzNBDMsTQhmq7xhCklm7wj4odu/lights/4/state',
    'http://192.168.0.203/api/KumTJJPCHNrw9PRhRemzY-TgWIVsGD-yRmWRkopd/lights/1/state'
  ],
  storage_room: [
    'http://192.168.0.203/api/KumTJJPCHNrw9PRhRemzY-TgWIVsGD-yRmWRkopd/lights/2/state'
  ],
  kitchen: [
    'http://192.168.0.144/api/NoGjUV9s9G5Ku0ifnGB3WGgdKFTSSnEbr9MsVgs-z/lights/1/state',
    'http://192.168.0.144/api/NoGjUV9s9G5Ku0ifnGB3WGgdKFTSSnEbr9MsVgs-z/lights/2/state'
  ],
  study: [
    'http://192.168.0.203/api/KumTJJPCHNrw9PRhRemzY-TgWIVsGD-yRmWRkopd/lights/3/state'
  ]
}

const events = {};

function playScene(scene) {
  const promise = new Promise.resolve()

  for (let delay in scene) {
    const event = scene[delay]

    for (let action of event.actions) {
      promise.delay(delay).then(() => {
        const actionPromise = getActionCall(action.name)(...action.options)

        if (event.id !== undefined) {
          events[event.id] ? null : events[event.id] = []
          events[event.id].push(actionPromise)
        }
      })
    }
  }
}

function getActionCall(name) {
  switch (name) {
    case 'blink': return actions.blink
    case 'fade-color': return actions.fadeColor
    case 'heartbeat': return actions.heartbeat
    case 'kill': return actions.kill
    case 'lights-on': return actions.lightsOn
    case 'lights-off': return actions.lightsOff
    case 'play-sound': return actions.playSound
    case 'pulse': return actions.pulse
    case 'dancehall': return actions.danceHall
    case 'random': return actions.random
    default: throw `unknown action type "${name}"`
  }
}
