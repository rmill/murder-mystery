window.onload = function () {
  events = {
    'lights-off': {
      0: { actions: [ {name: 'lights-off', options: [0]} ] }
    },
    'lights-on': {
      0: { actions: [ {name: 'lights-on', options: [0]} ] }
    },
    'murder': {
      0: {
        actions: [{name: 'lights-off', options: [0]}]
      },
      3000: {
        id: 1,
        actions: [
          {name: 'play-sound', options: ['heartbeat.wav']},
          {name: 'heartbeat', options: [2, 'red']}
        ]
      },
      20000: {
        actions: [
          {name: 'kill', options: [1]},
          {name: 'lights-on', options: [2]}
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
