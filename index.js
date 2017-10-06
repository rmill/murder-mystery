var player = require('play-sound')(opts = {})
  




// // const OSC = require('osc-js')
// const express = require('express')
// const request = require('request');
//
//
// //
// // const osc = new OSC({ plugin: new OSC.DatagramPlugin() })
// const app = express()
// //
// app.get('/', (req, res) => {
//   res.sendFile(__dirname + '/index.html')
// })
//
//
// const lights = [false, false, false, false, false];
// const groupUri = 'http://192.168.0.136/api/q5L1lMNztxiKWGQurDZ-hHuyGQ0IAKu42wRoQep6/groups/0/action';
// const method = 'PUT';
// let isOn = true;
//
// app.post('/test', (req, res) => {
//   // const message = new OSC.Message('heartbeat');
//   // osc.send(message, { port: 7400 })
//   // setInterval(() => {
//   //   const lightId = Math.floor(Math.random() * (5 - 1 + 1)) + 1;
//   //   lights[lightId - 1] = !lights[lightId - 1];
//   //   const lightsUri = `http://192.168.0.136/api/q5L1lMNztxiKWGQurDZ-hHuyGQ0IAKu42wRoQep6/lights/${lightId}/state`;
//   //   const json = {"on": lights[lightId - 1], "sat":0, "bri":254, "transitiontime": 0};
//   //   request({method, uri: lightsUri, json});
//   // }, 200);
//   if (isOn) {
//     isOn = false;
//     turnOffAll();
//   } else {
//     isOn = true;
//     turnOnAll();
//   }
// })
// //
// app.listen(3000, () => {
// //   osc.open()
//   turnOnAll();
//   console.log('Example app listening on port 3000!')
// })
//
// function turnOffAll() {
//   const json = {"on": false, "transitiontime": 0};
//   request({method, uri:groupUri, json});
// }
//
// function turnOnAll() {
//   const json = {"on": true, "bri": 200, "transitiontime": 0};
//   request({method, uri:groupUri, json});
// }
//
// // let x = 0;
// //
// // setInterval(() => {
// //   x += (Math.PI / 8);
// //   const bri = Math.floor((Math.sin(x) + 1) * (255/2));
// //   const json = {"on": true, "sat":0, bri, "hue":20000, "transitiontime": 0};
// //   request({method, uri, json});
// // }, 1000);
//
// // let on = true;
// // setInterval(() => {
// //   on = !on;
// //   const json = {on, "sat":255, "bri": 255, "hue":20000};
// //   request({method, uri, json});
// // }, 500);
//
// // console.log('here');
// // const json = {"on": true, "sat":0, "bri": 255, "hue":20000, "transitiontime":0};
// // request({method, uri, json}, () => {
// //   json.on = false;
// //   request({method, uri, json}, () => {
// //     json.on = true;
// //     request({method, uri, json});
// //   });
// // });
