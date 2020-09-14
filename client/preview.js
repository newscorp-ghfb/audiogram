var d3 = require("d3"),
    audio = require("./audio.js"),
    video = require("./video.js"),
    minimap = require("./minimap.js"),
    sampleWave = require("./sample-wave.js"),
    getRenderer = require("../renderer/"),
    getWaveform = require("./waveform.js");

var context = d3.select("canvas").node().getContext("2d");

var theme,
    caption,
    file,
    selection,
    newTheme,
    newCaption,
    subtitle;

function _file(_) {
  return arguments.length ? (file = _) : file;
}

function _theme(_) {
  return arguments.length ? (theme = _, redraw()) : theme;
}

function _caption(_) {
  return arguments.length ? (caption = _, redraw()) : caption;
}

function _selection(_) {
  return arguments.length ? (selection = _) : selection;
}

function _newTheme(_) {
  return arguments.length ? (newTheme = _) : newTheme;
}

function _newCaption(_) {
  return arguments.length ? (newCaption = _) : newCaption;
}

function _subtitle(_) {
  return arguments.length ? (subtitle = _) : subtitle;
}

minimap.onBrush(function(extent){

  var duration = audio.duration();

  selection = {
    duration: duration * (extent[1] - extent[0]),
    start: extent[0] ? extent[0] * duration : null,
    end: extent[1] < 1 ? extent[1] * duration : null
  };

  d3.select("#duration strong").text(Math.round(10 * selection.duration) / 10)
    .classed("red", theme && theme.maxDuration && theme.maxDuration < selection.duration);

});

// Resize video and preview canvas to maintain aspect ratio
function resize(width, height) {
  var widthFactor, heightFactor;
  if (height > width) {
    widthFactor = 360 / width;
    heightFactor = 640 / height;
  } else {
    widthFactor = 640 / width;
    heightFactor = 360 / height;
  }
  var factor = Math.min(widthFactor, heightFactor);

  d3.select("canvas")
    .attr("width", factor * width)
    .attr("height", factor * height);
    
  d3.select("#canvas")
    .style("width", (factor * width) + "px");

  d3.select("video")
    .attr("height", widthFactor * height);

  d3.select("#video")
    .attr("height", (widthFactor * height) + "px");

  context.setTransform(factor, 0, 0, factor, 0, 0);

}

function redraw() {

  resize(theme.width, theme.height);

  video.kill();

  var renderer = getRenderer(theme);

  renderer.backgroundImage(theme.backgroundImageFile || null);

  renderer.drawFrame(context, {
    caption: caption,
    waveform: sampleWave,
    frame: 0
  });

  if (location.pathname === "/theme") {
    const tf = (theme.noPattern === undefined) ? false : theme.noPattern;
    d3.select("#chkNoPattern").property("checked", tf);
  }

}

function loadAudio(f, cb) {

  d3.queue()
    .defer(getWaveform, f)
    .defer(audio.src, f)
    .await(function(err, data){

      if (err) {
        return cb(err);
      }

      file = f;
      minimap.redraw(data.peaks);

      cb(err);

    });

}

function loadNewTheme(f, cb) {
  d3.queue()
  .await(function(err, data){

      if (err) {
        return cb(err);
      }

      newTheme = f;

      cb(err);

    });
}

function loadSubtitle(f, cb) {
  d3.queue()
  .await(function(err, data){

      if (err) {
        return cb(err);
      }

      subtitle = f;

      cb(err);

    });
}

module.exports = {
  caption: _caption,
  theme: _theme,
  file: _file,
  selection: _selection,
  loadAudio: loadAudio,
  newTheme: _newTheme,
  newCaption: _newCaption,
  loadNewTheme: loadNewTheme,
  subtitle: _subtitle,
  loadSubtitle: loadSubtitle
};
