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
     "http://192.168.0.38/api/H-f1z0y9UnkCEbGW-1iWn3azeGNTe0sowTiGfo-g/lights/1/state",
      "http://192.168.0.136/api/gF6zPvhMfk15HRpW0PqDNJxrJctLzZtNd7d0aHpi/lights/1/state",
      "http://192.168.0.136/api/gF6zPvhMfk15HRpW0PqDNJxrJctLzZtNd7d0aHpi/lights/2/state",
      "http://192.168.0.136/api/gF6zPvhMfk15HRpW0PqDNJxrJctLzZtNd7d0aHpi/lights/3/state",
       "http://192.168.0.136/api/gF6zPvhMfk15HRpW0PqDNJxrJctLzZtNd7d0aHpi/lights/4/state",
       "http://192.168.0.203/api/caI8n5uZ4Rm51CGSvjynKsGPpOPokCizD2r72kqX/lights/1/state",
       "http://192.168.0.144/api/rPHTw33e7WNDmla44E0az0brAxTsxTZkZ87uOphN/lights/1/state",
       "http://192.168.0.144/api/rPHTw33e7WNDmla44E0az0brAxTsxTZkZ87uOphN/lights/2/state"
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
        .delay(50).then(() => request({ method: 'PUT', uri, json }))
        .delay(50).then(() => random(group, color))
}

function blink(group, light, times, color) {
  if (times === 0) {
    return Promise.resolve()
  }

  const colorJson = getColor(color);
  const json = Object.assign({ on: true, transitiontime: 0 }, colorJson);
  const uri = groups[group][light];

  const promise = new Promise.resolve()
  return promise.then(() => request({ method: 'PUT', uri, json }))
        .delay(150).then(() => request({ method: 'PUT', uri, json: { "on": false, transitiontime: 0 } }))
        .delay(150).then(() => blink(group, light, times - 1, color))
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
