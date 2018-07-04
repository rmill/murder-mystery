const fs = require("fs")

const FILE_LOCATION = './config.json'
var config

function getConfig() {
  if (config) {
    return config
  }

  try {
    var configFile = fs.readFileSync(FILE_LOCATION, { encoding: 'utf-8' })
  } catch(err) {
    console.log(err);
    return null
  }

  return JSON.parse(configFile)
}

function setConfig(configData) {
  config = configData
  fs.writeFileSync(FILE_LOCATION, JSON.stringify(configData))
  return config
}

exports.getConfig = getConfig
exports.setConfig = setConfig
