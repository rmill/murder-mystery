"use strict"

const bodyParser = require('body-parser');
const player = require('play-sound')()
const express = require('express')
const request = require('request-promise')
const Promise = require ('bluebird')
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
    case 'blink': return blink
    case 'fade-color': return fadeColor
    case 'heartbeat': return heartbeat
    case 'kill': return kill
    case 'lights-on': return lightsOn
    case 'lights-off': return lightsOff
    case 'play-sound': return playSound
    case 'pulse': return pulse
    case 'random': return random
    default: throw `unknown action type "${name}"`
  }
}

function fadeColor(group, duration, color) {
  // return new Promise((resolve) => { console.log('fadeColor') })
  const colorJson = getColor(color);
  const json = Object.assign({ on: true, transitiontime: duration }, colorJson);

  const requests = []
  for (let light of groups[group]) {
    requests.push(request({ method: 'PUT', uri: light, json }))
  }

  return Promise.all(requests);
}

function heartbeat(group, color) {
  const promise = new Promise.resolve()
  return promise.then(() => fadeColor(group, 0, color))
         .delay(200).then(() => fadeColor(group, 1, 'black'))
         .delay(1000).then(() => heartbeat(group, color))
}

function kill(id) {
  return new Promise((resolve) => {
    if (events[id]) {
      for(let promise of events[id]) promise.cancel()
    }
    resolve()
  })
}

function lightsOn(group, duration = 0, color = 'default') {
  // return new Promise((resolve) => { console.log('lightsOn', group, duration, color); resolve() })
  return fadeColor(group, duration, color)
}

function lightsOff(group, duration = 0) {
  // return new Promise((resolve) => { console.log('lightsOff', group, duration); resolve() })
  const json = { "on": false, "transitiontime": duration }

  const requests = []
  for (let light of groups[group]) {
    requests.push(request({ method: 'PUT', uri: light, json }))
  }

  return Promise.all(requests)
}

function playSound(file) {
  // return new Promise((resolve) => { console.log('playSound', file); resolve() })
  console.log(__dirname + `/assets/${file}`)
  return new Promise((resolve, error, onCancel) => {
    const audio = player.play(__dirname + `/assets/${file}`, () => resolve())
    onCancel(() => audio.kill())
  })
}

function pulse(group, duration, color) {
  const promise = new Promise.resolve()
  return promise.then(() => fadeColor(group, duration / 100, color))
         .delay(duration).then(() => fadeColor(group, duration / 100, 'black'))
         .delay(duration).then(() => pulse(group, duration, color))
}

function random(group, color) {
  const colorJson = getColor(color);
  const json = Object.assign({ on: true, transitiontime: 0 }, colorJson);
  const uri = groups[group][Math.floor(Math.random() * groups[group].length)];

  const promise = new Promise.resolve()
  return promise.then(() => request({ method: 'PUT', uri, json: { "on": false, transitiontime: 0 } }))
        .delay(100).then(() => request({ method: 'PUT', uri, json }))
        .delay(100).then(() => random(group, color))
}

function blink(group, light, times, color) {
  if (times === 0) {
    return promise.resolve()
  }

  const colorJson = getColor(color);
  const json = Object.assign({ on: true, transitiontime: 0 }, colorJson);
  const uri = groups[light];

  const promise = new Promise.resolve()
  return promise.then(() => request({ method: 'PUT', uri, json: { "on": false, transitiontime: 0 } }))
        .delay(100).then(() => request({ method: 'PUT', uri, json }))
        .delay(100).then(() => blink(group, light, times--, color))
}

function getColor(color) {
  switch (color) {
    case 'default':
    case 'white': return { hue: 10000, sat: 50, bri: 150 }
    case 'black': return { on: false }
    case 'red': return { hue: 65000, sat: 255, bri: 250 }
    case 'green': return { hue: 20000, sat: 255, bri: 250 }
    case 'purple': return { hue: 50000, sat: 255, bri: 250 }
  }
}
