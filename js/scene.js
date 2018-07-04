
const events = {}

function playScene(scene) {
  if (!config) {
    throw 'No config file found. Please add one first.';
  }

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

function kill(id) {
  return new Promise((resolve) => {
    if (events[id]) {
      for(let promise of events[id]) promise.cancel()
    }
    resolve()
  })
}

exports.playScene = playScene
