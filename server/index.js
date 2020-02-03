// Dependencies
var express = require("express"),
    compression = require("compression"),
    path = require("path"),
    multer = require("multer"),
    uuid = require("uuid"),
    mkdirp = require("mkdirp");

// Routes and middleware
var logger = require("../lib/logger/"),
    render = require("./render.js"),
    status = require("./status.js"),
    fonts = require("./fonts.js"),
    errorHandlers = require("./error.js"),
    fs = require("fs");;

// Settings
var serverSettings = require("../lib/settings/");

var app = express();

app.use(compression());
app.use(logger.morgan());

// Options for where to store uploaded audio and max size
var fileOptions = {
  storage: multer.diskStorage({
    destination: function(req, file, cb) {

      var dir = path.join(serverSettings.workingDirectory, uuid.v1());

      mkdirp(dir, function(err) {
        return cb(err, dir);
      });
    },
    filename: function(req, file, cb) {
      cb(null, "audio");
    }
  })
};

var newThemeFileOptions = {
  storage: multer.diskStorage({
    destination: function(req, file, cb) {

      var dir = path.join(serverSettings.themeStoragePath);

      mkdirp(dir, function(err) {
        return cb(err, dir);
      });
    },
    filename: function(req, file, cb) {
      cb(null, file.originalname);
    }
  })
};

if (serverSettings.maxUploadSize) {
  fileOptions.limits = {
    fileSize: +serverSettings.maxUploadSize
  };
  newThemeFileOptions.limits = {
    fileSize: +serverSettings.maxUploadSize
  };
}

// On submission, check upload, validate input, and start generating a video
app.post("/submit/", [multer(fileOptions).single("audio"), render.validate, render.route]);

// Upload new theme
app.post("/theme/upload/", [multer(newThemeFileOptions).single("newTheme"), function (req, res) {
  var themesFile = path.join(serverSettings.settingsPath, "themes.json");
  fs.readFile(themesFile, "utf8", function readFileCallback(err, data) {
    if (err) {
      console.log('err', err);
      return null;
    } else {
      var caption = req.body.newCaption;
      var themes = JSON.parse(data);
      themes[caption] = {
        "backgroundImage": req.file.filename
      };
      var jt = JSON.stringify(themes);
      fs.writeFile(themesFile, jt, "utf8", function (err) {
        if (err) {
          console.log(err);
          return null;
        }
      });
    }
  });
  res.end();
}]);

// If not using S3, serve videos locally
if (!serverSettings.s3Bucket) {
  app.use("/video/", express.static(path.join(serverSettings.storagePath, "video")));
}

// Serve custom fonts
app.get("/fonts/fonts.css", fonts.css);
app.get("/fonts/fonts.js", fonts.js);

if (serverSettings.fonts) {
  app.get("/fonts/:font", fonts.font);
}

// Check the status of a current video
app.get("/status/:id/", status);


// Serve background images and themes JSON statically
app.use("/settings/", function(req, res, next) {

  // Limit to themes.json and bg images
  if (req.url.match(/^\/?themes.json$/i) || req.url.match(/^\/?backgrounds\/[^/]+$/i)) {
    return next();
  }

  return res.status(404).send("Cannot GET " + path.join("/settings", req.url));

}, express.static(path.join(__dirname, "..", "settings")));

// Serve editor files statically
app.use(express.static(path.join(__dirname, "..", "editor")));

app.use(errorHandlers);

module.exports = app;
