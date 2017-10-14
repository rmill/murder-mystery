window.onload = function () {
  events = {
    'lights-off': {
      0: { actions: [ {name: 'lights-off', options: ['all']} ] }
    },
    'lights-on': {
      0: { actions: [ {name: 'lights-on', options: ['all']} ] }
    },
    'murder': {
      0: {
        actions: [{name: 'lights-off', options: ['all']}]
      },
      3000: {
        id: 1,
        actions: [
          {name: 'play-sound', options: ['heartbeat.wav']},
          {name: 'heartbeat', options: ['all', 'red']}
        ]
      },
      20000: {
        actions: [
          {name: 'kill', options: [1]},
          {name: 'lights-on', options: ['all']}
        ]
      }
    },
    'yes': {
      0: {
        actions: [{name: 'fade-color', options: ['all', 5, 'green']}]
      },
      400: {
        actions: [{name: 'fade-color', options: ['all', 5, 'default']}]
      }
    },
    "purple-pulse": {
      0: {
        actions: [
          {name: 'pulse', options: ['kitchen', 1500, 'purple']}
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
