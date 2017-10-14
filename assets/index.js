window.onload = function () {
  events = {
    'lights-off': {
      0: { actions: [ {name: 'lights-off', options: ['all']} ] }
    },
    'lights-on': {
      0: { actions: [ {name: 'lights-on', options: ['all', 10]} ] }
    },
    'murder': {
      // 0: {
      //   actions: [{name: 'lights-off', options: ['all']}]
      // },
      0: {
        id: 1,
        actions: [
          {name: 'play-sound', options: ['heartbeat.wav']},
          // {name: 'heartbeat', options: ['all', 'red']}
        ]
      },
      9000: {
        id: 2,
        actions: [
          {name: 'play-sound', options: ['satanic_mill.wav']},
        ]
      },
      12000: {
        actions: [
          {name: 'play-sound', options: ['scrape.wav']},
        ]
      },
      23000: {
        actions: [
          {name: 'kill', options: [1]},
          {name: 'kill', options: [2]},
          {name: 'lights-on', options: ['all']}
        ]
      }
    },
    'yes': {
      0: {
        actions: [{name: 'blink', options: ['living_room', 0, 2, 'green']}]
      }
    },
    'no': {
      0: {
        actions: [{name: 'blink', options: ['living_room', 0, 1, 'green']}]
      }
    },
    'angry': {
      0: {
        id: 3,
        actions: [{name: 'random', options: ['living_room', 'red']}]
      },
      2000: {
        actions: [
          {name: 'kill', options: [3]},
          {name: 'lights-off', options: ['living_room']}
        ]
      }
    },
    'purple-pulse': {
      0: {
        id: 2,
        actions: [
          {name: 'pulse', options: ['all', 1500, 'purple']}
        ]
      }
    },
    "kill-purple": {
      0: {
        actions: [
          {name: 'kill', options: [2]},
          {name: 'lights-on', options: ['all', 10]}
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
