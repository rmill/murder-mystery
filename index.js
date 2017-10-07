const player = require('play-sound')(opts = {})
const express = require('express')
const request = require('request');

const app = express()

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html')
})

app.post('/action', (req, res) => {
  playSceme(req.json);
});

app.listen(3000, () => {
  console.log('Example app listening on port 3000!')
})

const ip = '192.168.0.136'
const user = 'api/q5L1lMNztxiKWGQurDZ-hHuyGQ0IAKu42wRoQep6'
const groupUri = `http://${ip}/${user}/group`;

function playScene(scene) {
  
}

function lightsOn(group, duration = 0, color = 'default') {
  const uri = `${groupUri}/${group}/action`
  const colorJson = getColor(color);
  const json = { "on": true. "transitiontime": duration }.assign(colorJson);
  request({ method: 'PUT', uri, json });
}

function lightsOff(group, duration = 0) {
  const uri = `${groupUri}/${group}/action`
  const json = { "on": false. "transitiontime": duration }
  request({ method: 'PUT', uri, json });
}

function getColor(color) {
  switch (color) {
    case 'white': return { hue: 0, sat: 0, bri: 255 };
  }
}
