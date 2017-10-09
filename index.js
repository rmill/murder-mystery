"use strict"

const player = require('play-sound')()
const express = require('express')
const request = require('request')
const Promise = require ('bluebird')
const app = express()

Promise.config({ cancellation: true })

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html')
})

app.post('/action', (req, res) => {
  playSceme(req.json)
})

// app.listen(3000, () => {
//   console.log('Example app listening on port 3000!')
// })

const ip = '192.168.0.136'
const user = 'api/q5L1lMNztxiKWGQurDZ-hHuyGQ0IAKu42wRoQep6'
const groupUri = `http://${ip}/${user}/group`

function playScene(scene) {
  const promise = new Promise.resolve()
  const events = {};

  for (let delay in scene) {
    const event = scene[delay]

    for (let action of event.actions) {
      if (action.name === 'kill') {
        action.options.push(events)
      }

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
    case 'fade-color': return fadeColor
    case 'heartbeat': return heartbeat
    case 'kill': return kill
    case 'lights-on': return lightsOn
    case 'lights-off': return lightsOff
    case 'play-sound': return playSound
    default: throw `unknown action type "${name}"`
  }
}

function fadeColor(group, duration, color) {
  // return new Promise((resolve) => { console.log('fadeColor') })
  const uri = `${groupUri}/${group}/action`
  const colorJson = getColor(color);
  const json = { "on": true, "transitiontime": duration }.assign(colorJson);
  return request({ method: 'PUT', uri, json });
}

function heartbeat(group) {
  const promise = new Promise((resolve) => {
    console.log('heartbeat', group)
    playSound('heartbeat.wav')
    resolve()
  })
  return promise.delay(0).then(() => lightsOn(group))
         .delay(100).then(() => lightsOff(group))
         .delay(500).then(() => lightsOn(group))
         .delay(100).then(() => lightsOff(group))
         .then(() => heartbeat(group))
}

function kill(id, events) {
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
  const uri = `${groupUri}/${group}/action`
  const json = { "on": false. "transitiontime": duration }
  return request({ method: 'PUT', uri, json });
}

function playSound(file) {
  // return new Promise((resolve) => { console.log('playSound', file); resolve() })
  return new Promise((resolve) => player.play(__dirname + `/assets/${file}`, () => resolve()))
}

function getColor(color) {
  switch (color) {
    case 'white': return { hue: 0, sat: 0, bri: 255 };
  }
}

// let scene1 = {
//   0: {
//     actions: [{name: 'lights-off', options: [0]}]
//   },
//   1000: {
//     id: 1,
//     actions: [{name: 'heartbeat', options: [0]}]
//   },
//   5000: {
//     actions: [
//       {name: 'play-sound', options: ['test1']}
//     ]
//   },
//   6000: {
//     actions: [{name: 'play-sound', options: ['test2']}]
//   },
//   7000: {
//     actions: [
//       {name: 'kill', options: [1]}
//     ]
//   }
// }
//
// playScene(scene1)
