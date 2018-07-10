const request = require('request-promise')
const Promise = require('bluebird')

const UPNP_URL = 'https://www.meethue.com/api/nupnp'

module.exports = () => {
  return getBridges()
    .then((bridges) => processRequest(bridges))
}

function processRequest(bridges) {
  var bridgePromises = [];
  bridges.forEach((bridge) => {
    var promise = Promise.resolve()
    .then(() => { bridge = processBridge(bridge) })
    .then(() => getLights(bridge))
    .then((lights) => processLights(lights, bridge))

    bridgePromises.push(promise)
  });

  return Promise.all(bridgePromises);
}

function processBridge(bridge) {
  console.log('processBridge', bridge.id)
  return {
    id: bridge.id,
    ip: bridge.internalipaddress,
    user: null,
    lights: null
  }
}

function processLights(lights, bridge) {
  console.log('processLights', lights)
  bridge.lights = {}

  for(var i in lights) {
    bridge.lights[i] = { id: lights[i].uniqueid }
  }

  return bridge
}

function processUser(user, bridge) {
  console.log('processUser', bridge.id)
  return user[0].success.username
}

function getBridges() {
  return request.get(UPNP_URL, { json: true })
}

function getLights(bridge) {
  console.log('getLights', bridge.id)
  return makeHueRequest('GET', bridge, 'lights')
    .catch((err) => handleGetLightsError(err, bridge))
}

function createUser(bridge) {
  console.log('createUser', bridge.id)
  var json = { 'devicetype': 'my_hue_app#webapp root' }
  return makeHueRequest('POST', bridge, '', json)
    .catch((err) => handleCreateUserError(err, bridge))
}

function makeHueRequest(method, bridge, resource = null, json = true) {
  var uri = `http://${bridge.ip}/api`

  if (resource) {
      uri += `/${bridge.user}/${resource}`
  }

  var options = { method, uri, json }

  return request(options)
    .then((res) => {
      console.log(uri, res)
      if (isError(res)) {
        throwError(res)
      }

      return res
    })
}

function isError(res) {
  return Array.isArray(res) && res[0] && res[0].error
}

function throwError(res) {
  var message = res[0].error.description
  switch (res[0].error.type) {
    case 1: throw new UnauthorizedError(message)
    case 101: throw new LinkButtonNeededError(message)
    default: throw new Error(message)
  }
}

function handleGetLightsError(err, bridge) {
  if (err instanceof UnauthorizedError) {
    // Need to create a user
    console.log(bridge.id, err.message)
    return createUser(bridge)
      .then((user) => { bridge.user = processUser(user, bridge) })
      .then(() => getLights(bridge))
  }

  throw err
}

function handleCreateUserError(err, bridge) {
  // Need to press link button
  if (err instanceof LinkButtonNeededError) {
    // Add delay and retry
    console.log(bridge.id, err.message)
    return Promise.delay(2000).then(() => createUser(bridge))
  }

  throw err
}

class UnauthorizedError extends Error {}
class LinkButtonNeededError extends Error {}
