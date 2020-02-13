var smartquotes = require("smartquotes").string;

function wrapSubtitleText(theme, context, subtitle) {
  var left = ifNumeric(theme.subtitleLeft, 0),
      right = ifNumeric(theme.subtitleRight, theme.width),
      bottom = ifNumeric(theme.subtitleBottom, null),
      top = ifNumeric(theme.subtitleTop, null);

  if (bottom === null && top === null) {
    top = 0;
  }

  var subtitleWidth = right - left;

  if (!subtitle) {
    return;
  }

  var lines = [[]],
      maxWidth = 0,
      words = smartquotes(subtitle + "").trim().replace(/\s\s+/g, " \n").split(/ /g);

  context.font = theme.subtitleFont;
  context.textBaseline = "top";
  context.textAlign = theme.subtitleAlign || "right";

  // Check whether each word exceeds the width limit
  // Wrap onto next line as needed
  words.forEach(function(word,i){

    var width = context.measureText(lines[lines.length - 1].concat([word]).join(" ")).width;

    if (word[0] === "\n" || (lines[lines.length - 1].length && width > subtitleWidth)) {

      word = word.trim();
      lines.push([word]);
      width = context.measureText(word).width;

    } else {

      lines[lines.length - 1].push(word);

    }

    maxWidth = Math.max(maxWidth,width);

  });

  var totalHeight = lines.length * theme.subtitleLineHeight + (lines.length - 1) * theme.subtitleLineSpacing;

  // horizontal alignment
  var x = theme.subtitleAlign === "left" ? left : theme.subtitleAlign === "right" ? right : (left + right) / 2;

  // Vertical alignment
  var y;

  if (top !== null && bottom !== null) {
    // Vertical center
    y = (bottom + top - totalHeight) / 2;
  } else if (bottom !== null) {
    // Vertical align bottom
    y = bottom - totalHeight;
  } else {
    // Vertical align top
    y = top;
  }

  // context.fillStyle = theme.subtitleColor;
  lines.forEach(function(line, i){
    context.fillText(line.join(" "), x, y + i * (theme.subtitleLineHeight + theme.subtitleLineSpacing));
  });

}

module.exports = function(theme) {

  // Do some typechecking
  var left = ifNumeric(theme.captionLeft, 0),
      right = ifNumeric(theme.captionRight, theme.width),
      bottom = ifNumeric(theme.captionBottom, null),
      top = ifNumeric(theme.captionTop, null);

  if (bottom === null && top === null) {
    top = 0;
  }

  var captionWidth = right - left;

  const self = this;
  self.theme = theme;

  return function(context, caption, subtitle) {

    if (subtitle) {
      return wrapSubtitleText(self.theme, context, subtitle);
    }

    if (!caption) {
      return;
    }

    var lines = [[]],
        maxWidth = 0,
        words = smartquotes(caption + "").trim().replace(/\s\s+/g, " \n").split(/ /g);

    context.font = theme.captionFont;
    context.textBaseline = "top";
    context.textAlign = theme.captionAlign || "center";

    // Check whether each word exceeds the width limit
    // Wrap onto next line as needed
    words.forEach(function(word,i){

      var width = context.measureText(lines[lines.length - 1].concat([word]).join(" ")).width;

      if (word[0] === "\n" || (lines[lines.length - 1].length && width > captionWidth)) {

        word = word.trim();
        lines.push([word]);
        width = context.measureText(word).width;

      } else {

        lines[lines.length - 1].push(word);

      }

      maxWidth = Math.max(maxWidth,width);

    });

    var totalHeight = lines.length * theme.captionLineHeight + (lines.length - 1) * theme.captionLineSpacing;

    // horizontal alignment
    var x = theme.captionAlign === "left" ? left : theme.captionAlign === "right" ? right : (left + right) / 2;

    // Vertical alignment
    var y;

    if (top !== null && bottom !== null) {
      // Vertical center
      y = (bottom + top - totalHeight) / 2;
    } else if (bottom !== null) {
      // Vertical align bottom
      y = bottom - totalHeight;
    } else {
      // Vertical align top
      y = top;
    }

    context.fillStyle = theme.captionColor;
    lines.forEach(function(line, i){
      context.fillText(line.join(" "), x, y + i * (theme.captionLineHeight + theme.captionLineSpacing));
    });

 };


}

function ifNumeric(val, alt) {
  return (typeof val === "number" && !isNaN(val)) ? val : alt;
}
