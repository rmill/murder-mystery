function fadeColor(group, duration, color) {
  // return new Promise((resolve) => { console.log('fadeColor') })
  const colorJson = getColor(color);
  const json = Object.assign({ on: true, transitiontime: duration }, colorJson);

  const requests = []
  for (let light of group) {
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

function danceHall(group, duration) {
  const promises = {};
  for(let light of group) {
    setInterval(() => {
      if (promises[light]) promises[light].cancel();
      promises[light] = pulse([light], duration, randomColor())
    }, Math.random() * 5000);
  }
}

function randomColor() {
  const colors = ["red", "green", "purple", "dim"];
  return colors[Math.floor(Math.random() * colors.length)];
}

function getColor(color) {
  switch (color) {
    case 'default':
    case 'white': return { hue: 10000, sat: 50, bri: 150 }
    case 'dim': return { hue: 40000, sat: 200, bri: 150 }
    case 'black': return { on: false }
    case 'red': return { hue: 65000, sat: 255, bri: 150 }
    case 'green': return { hue: 20000, sat: 255, bri: 150 }
    case 'purple': return { hue: 50000, sat: 255, bri: 150 }
  }
}

exports.randomColor = randomColor;
exports.danceHall = danceHall;
exports.blink = blink;
exports.random = random;
exports.pulse = pulse;
exports.playSound = playSound;
exports.lightsOn = lightsOn;
exports.lightsOff = lightsOff;
exports.kill = kill;
exports.heartbeat = heartbeat;
