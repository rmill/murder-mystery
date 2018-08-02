var configuration = {}

window.onload = () => {
  getConfig();
};

function getConfig() {
  $.ajax({
    url: '/config',
    type: "GET",
    success: onConfigSuccess,
    error: onConfigError,
  });
}

function onConfigSuccess(config) {
  configuration = config

  // Add all of the lights
  for (var index in config.lights) {
    var light = config.lights[index]
    var lightGroup = getGroup(config, light)

    // Get all of the select options
    var groupOptions = '<option></option>'
    for (var index in config.groups) {
      var group = config.groups[index]
      var selected = lightGroup === index ? 'selected' : ''
      groupOptions += `<option value='${index}' ${selected}>${index}</option>`
    }

    // Create the select box
    var groupSelect = `<select>${groupOptions}</select>`

    // Create the light div
    var selected = lightGroup ? 'selected' : ''
    var lightEl = `<div class='light ${selected}' data-light='${light.id}'><span>${light.url}</span>${groupSelect}<button>Test</button><input class="brightness" type="range"><input class="jscolor" value="ab2567"></div>`
    $('.lights').append(lightEl)
  }

  $('.light button').on('click', (e) => {
    var el = $(e.target).parent('.light')
    var options = { lights: [el.data('light')], times: 3 }
    var data =  { 0: { actions: [{ name: 'blink', options }]}}

    $.ajax({
      type: 'POST',
      url: '/scene',
      data: JSON.stringify(data),
      dataType: 'json',
      contentType: 'application/json'
    })
  })

  $('.light select').on('change', (e) => {
    var el = $(e.target)
    el.val() ? el.parent('.light').addClass('selected') : el.parent('.light').removeClass('selected')
  })

  $('.brightness').on('change', function () {
    var brightness = Math.floor($(this).val() / 100 * 254)
    var el = $(this).parent('.light')
    var options = { lights: [el.data('light')], brightness }
    var data =  { 0: { actions: [{ name: 'fade-color', options }]}}

    $.ajax({
      type: 'POST',
      url: '/scene',
      data: JSON.stringify(data),
      dataType: 'json',
      contentType: 'application/json'
    })
  })

  $('.save').on('click', (e) => {
    var config = {}
    for (group in configuration.groups) {
      config[group] = []
    }

    $('.light select').each(function (select)  {
      var val = $(this).val()
      if (val) {
        config[val].push($(this).parent('.light').data('light'))
      }
    })

    $.ajax({
      type: 'PUT',
      url: '/config/groups',
      data: JSON.stringify(config),
      dataType: 'json',
      contentType: 'application/json'
    })
  })
}

function onConfigError(error) {
  alert(error)
}

function getGroup(config, light) {
  for (var i in config.groups) {
    if (config.groups[i].includes(light.id)) {
      return i
    }
  }

  return null
}
