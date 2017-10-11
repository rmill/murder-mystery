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

const ip = '192.168.0.136'
const user = 'q5L1lMNztxiKWGQurDZ-hHuyGQ0IAKu42wRoQep6'
const groupUri = `http://${ip}/api/${user}/groups`
const lightUri = `http://${ip}/api/${user}/lights`

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
  // const uri = `${groupUri}/${group}/action`
  // const uri = `${lightUri}/${group}/state`
  const colorJson = getColor(color);
  const json = Object.assign({ on: true, transitiontime: duration }, colorJson);
  return Promise.all([
    request({ method: 'PUT', uri: `${lightUri}/2/state`, json }),
    request({ method: 'PUT', uri: `${lightUri}/3/state`, json }),
    request({ method: 'PUT', uri: `${lightUri}/4/state`, json })
  ]);
}

function heartbeat(group, color) {
  const promise = new Promise.resolve()
  return promise.then(() => fadeColor(group, 0, color))
         .delay(200).then(() => fadeColor(group, 1, 'black'))
         .delay(1000).then(() => heartbeat(group, color))
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
  // const uri = `${groupUri}/${group}/action`
  const uri = `${lightUri}/${group}/state`
  const json = { "on": false, "transitiontime": duration }
  return Promise.all([
    request({ method: 'PUT', uri: `${lightUri}/2/state`, json }).catch((e) => console.log(e)),
    request({ method: 'PUT', uri: `${lightUri}/3/state`, json }).catch((e) => console.log(e)),
    request({ method: 'PUT', uri: `${lightUri}/4/state`, json }).catch((e) => console.log(e))
  ])
}

function playSound(file) {
  // return new Promise((resolve) => { console.log('playSound', file); resolve() })
  console.log(__dirname + `/assets/${file}`)
  return new Promise((resolve, error, onCancel) => {
    const audio = player.play(__dirname + `/assets/${file}`, () => resolve())
    onCancel(() => audio.kill())
  })
}

function getColor(color) {
  switch (color) {
    case 'default':
    case 'white': return { hue: 0, sat: 0, bri: 150 };
    case 'black': return { on: false }
    case 'red': return { hue: 65000, sat: 255, bri: 150 };
  }
}
