window.onload = function () {
  events = {
    'lights-off': {
      0: { actions: [ {name: 'lights-off', options: ['all']} ] }
    },
    'lights-on': {
      0: { actions: [ {name: 'lights-on', options: ['all', 10]} ] }
    },
    'murder': {
      0: {
        actions: [{name: 'lights-off', options: ['all']}]
      },
      3000: {
        id: 1,
        actions: [
          {name: 'heartbeat', options: ['all', 'red']}
        ]
      },
      3001: {
        id: 2,
        actions: [
          {name: 'play-sound', options: ['heartbeat.wav']}
        ]
      },
      10000: {
        id: 3,
        actions: [
          {name: 'kill', options: [1]},
          {name: 'lights-off', options: [1]},
          {name: 'play-sound', options: ['satanic_mill2.wav']},
        ]
      },
      10001: {
        actions: [
          {name: 'fade-color', options: ['all', 160, 'red']}
        ]
      },
      15000: {
        actions: [
          {name: 'play-sound', options: ['scrape.wav']},
        ]
      },
      26000: {
        actions: [
          {name: 'kill', options: [2]},
          {name: 'kill', options: [3]},
          {name: 'lights-off', options: ['all']}
        ]
      }
    },
    'yes': {
      0: {
        actions: [{name: 'blink', options: ['living_room', 0, 2, 'default']}]
      }
    },
    'no': {
      0: {
        actions: [{name: 'blink', options: ['living_room', 0, 1, 'default']}]
      }
    },
    'angry': {
      0: {
        id: 3,
        actions: [{name: 'random', options: ['living_room', 'red']}]
      },
      1000: {
        actions: [
          {name: 'kill', options: [3]},
          {name: 'lights-off', options: ['living_room']}
        ]
      },
      1001: {
        actions: [
          {name: 'fade-color', options: ['living_room', 10, 'red']}
        ]
      },
      2000: {
        actions: [
          {name: 'lights-off', options: ['living_room']}
        ]
      }
    },
    'purple-pulse': {
      0: {
        id: 1,
        actions: [
          {name: 'pulse', options: ['all', 1500, 'purple']}
        ]
      },
      1: {
        id: 2,
        actions: [
          {name: 'play-sound', options: ['purple_pulse.wav']}
        ]
      }
    },
    "kill-purple": {
      0: {
        actions: [
          {name: 'kill', options: [3]},
          {name: 'kill', options: [1]},
          {name: 'lights-off', options: ['all']}
        ]
      },
      1000: {
        actions: [
          {name: 'fade-color', options: ['storage_room', 50, 'red']}
        ]
      },
      6000: {
        actions: [
          {name: 'kill', options: [2]},
          {name: 'lights-on', options: ['all']}
        ]
      }
    },
    "demonic": {
      0: {
        id: 3,
        actions: [
          {name: "play-sound", options: ['demonic.wav']}
        ]
      }
    }
  };

  $('button').click(function() {
    var data = JSON.stringify(events[$(this).attr('id')])
    $.ajax({
      url: '/scene',
      type: "POST",
      data: data,
      contentType: "application/json",
    });
  });
};
