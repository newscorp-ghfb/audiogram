// var d3 = require("d3"),
var patterns = require("./patterns.js"),
    textWrapper = require("./text-wrapper.js");

module.exports = function(t) {

  var renderer = {},
      backgroundImage,
      wrapText,
      theme;

  renderer.backgroundImage = function(_) {
    if (!arguments.length) return backgroundImage;
    backgroundImage = _;
    return this;
  };

  renderer.theme = function(_) {
    if (!arguments.length) return theme;

    theme = _;

    // Default colors
    theme.backgroundColor = theme.backgroundColor || "#fff";
    theme.waveColor = theme.waveColor || theme.foregroundColor || "#000";
    theme.captionColor = theme.captionColor || theme.foregroundColor || "#000";

    // Default wave dimensions
    if (typeof theme.waveTop !== "number") theme.waveTop = 0;
    if (typeof theme.waveBottom !== "number") theme.waveBottom = theme.height;
    if (typeof theme.waveLeft !== "number") theme.waveLeft = 0;
    if (typeof theme.waveRight !== "number") theme.waveRight = theme.width;

    /*if (location.pathname === "/theme") {
      const tf = (theme.noPattern === undefined) ? false : theme.noPattern;
      d3.select("#chkNoPattern").property("checked", tf);
    }*/

    wrapText = textWrapper(theme);

    return this;
  };

  // Draw the frame
  renderer.drawFrame = function(context, options){

    context.patternQuality = "best";

    // Draw the background image and/or background color
    context.clearRect(0, 0, theme.width, theme.height);

    context.fillStyle = theme.backgroundColor;
    context.fillRect(0, 0, theme.width, theme.height);

    if (backgroundImage) {
      context.drawImage(backgroundImage, 0, 0, theme.width, theme.height);
    }

    if (!theme.noPattern) {
      patterns[theme.pattern || "wave"](context, options.waveform, theme);
    }

    // Write the caption
    if (options.caption) {
      wrapText(context, options.caption);
    }
    // Write subtitle
    if (options.subtitle) {
      wrapText(context, null, options.subtitle);
    }

    return this;

  };

  if (t) {
    renderer.theme(t);
  }

  return renderer;

}
