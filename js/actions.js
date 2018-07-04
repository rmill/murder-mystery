/**
 * Fade a set of lights to a specific color
 * @param {string[]} lights The set of lights
 * @param {number} duration The duration of the fade
 * @param {string} color The color to fade to
 * @return {Promise}
 */
function fadeColor(lights, duration, color) {
  // return new Promise((resolve) => { console.log('fadeColor') })
  const colorJson = getColor(color);
  const json = Object.assign({ on: true, transitiontime: duration }, colorJson);

  const requests = []
  for (let light of lights) {
    requests.push(request({ method: 'PUT', uri: light, json }))
  }

  return Promise.all(requests);
}

/**
 * Perform the heartbeat effect
 * @param {string[]} lights The set of lights
 * @param {string} color The color to use
 * @return {Promise}
 */
function heartbeat(lights, color) {
  const promise = new Promise.resolve()
  return promise.then(() => fadeColor(lights, 0, color))
         .delay(200).then(() => fadeColor(lights, 1, 'black'))
         .delay(1000).then(() => heartbeat(lights, color))
}

/**
 * Turn a set of lights on
 * @param {string[]} lights The set of lights
 * @param {number} duration The length of fade
 * @param {string} color The color to turn the lights to
 * @return {Promise}
 */
function lightsOn(lights, duration = 0, color = 'default') {
  // return new Promise((resolve) => { console.log('lightsOn', lights, duration, color); resolve() })
  return fadeColor(lights, duration, color)
}

/**
 * Turn a set of lights off
 * @param {string[]} lights The set of lights
 * @param {number} duration The length of fade
 * @return {Promise}
 */
function lightsOff(lights, duration = 0) {
  // return new Promise((resolve) => { console.log('lightsOff', lights, duration); resolve() })
  const json = { "on": false, "transitiontime": duration }

  const requests = []
  for (let light of lights) {
    requests.push(request({ method: 'PUT', uri: light, json }))
  }

  return Promise.all(requests)
}

/**
 * Play a sound
 * @param {string} file The name of the sound
 * @return {Promise}
 */
function playSound(file) {
  // return new Promise((resolve) => { console.log('playSound', file); resolve() })
  return new Promise((resolve, error, onCancel) => {
    const audio = player.play(__dirname + `/assets/${file}`, () => resolve())
    onCancel(() => audio.kill())
  })
}

/**
 * Pulse a set of lights
 * @param {string[]} lights The set of lights
 * @param {number} duration The length of the pulse
 * @param {string} color The color to pulse the lights
 * @return {Promise}
 */
function pulse(lights, duration, color) {
  const promise = new Promise.resolve()
  return promise.then(() => fadeColor(lights, duration / 100, color))
         .delay(duration).then(() => fadeColor(lights, duration / 100, 'black'))
         .delay(duration).then(() => pulse(lights, duration, color))
}

/**
 * Randomly blink a set of lights
 * @param {string[]} lights The set of lights
 * @param {string} color The color to blink the lights
 * @return {Promise}
 */
function random(lights, color) {
  const colorJson = getColor(color);
  const json = Object.assign({ on: true, transitiontime: 0 }, colorJson);
  const light = lights[Math.floor(Math.random() * lights.length)];

  const promise = new Promise.resolve()
  return promise.then(() => request({ method: 'PUT', light, json: { "on": false, transitiontime: 0 } }))
        .delay(50).then(() => request({ method: 'PUT', light, json }))
        .delay(50).then(() => random(lights, color))
}

/**
 * Blink a single light
 * @param {string} light The url of the light
 * @param {number} times The number of times to blink the light
 * @param {color} string The color to blink it
 * @return Promise
 */
function blink(light, times, color) {
  if (times <= 0) {
    return Promise.resolve()
  }

  const colorJson = getColor(color);
  const json = Object.assign({ on: true, transitiontime: 0 }, colorJson);

  const promise = new Promise.resolve()
  return promise.then(() => request({ method: 'PUT', light, json }))
        .delay(150).then(() => request({ method: 'PUT', light, json: { "on": false, transitiontime: 0 } }))
        .delay(150).then(() => blink(light, times - 1, color))
}

/**
 * Turn the lights of lights into a dance hall
 * @param {string[]} lights A list of lights to affect
 * @param {number} duration The length of time between changing light effect
 * @return Promise
 */
function danceHall(lights, duration) {
  const promises = {};
  for(let light of lights) {
    setInterval(() => {
      if (promises[light]) promises[light].cancel();
      promises[light] = pulse([light], duration, randomColor())
    }, Math.random() * 5000);
  }
}

/**
 * Get a random color
 * @return string
 */
function randomColor() {
  const colors = ["red", "green", "purple", "dim"];
  return colors[Math.floor(Math.random() * colors.length)];
}

/**
 * Get the parameters for a color
 * @param {string} color The name of the color
 * @return {Object}
 */
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
exports.heartbeat = heartbeat;
