// init project
const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const helmet = require("helmet");
const Todo = require("../schemas/todo_schema.js");
const cors = require('cors');

// using the body parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// implementing cors

const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS.split(",");

app.use(cors({
  origins: function (origin, callback) {
    if(ALLOWED_ORIGINS.indefOf(origin) === -1){
      var msg = 'The CORS policy for this site does not ' +
      'allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }

    return callback(null, true);
  }
}));

// set some security measures with helmet
app.use(
  helmet({
    frameguard: { action: "deny" },
    hidePoweredBy: { setTo: "PHP 7.3.0" }
  })
);
// creating a connection instant for mongodb database
mongoose.connect(process.env.DB, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// http://expressjs.com/en/starter/static-files.html
app.use(express.static("../public"));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function(req, res) {
  res.sendFile(path.resolve(__dirname, "..") + "/views/index.html");
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));

db.once("open", function() {
  console.log("We're in!");

  function checkHeader(req, res) {
    if (!(req.get("todo") === "redo")) {
      res.status(418).send({
        msg: "Sorry but you don't have the credentials."
      });
      return false;
    }
    return true;
  }

  app.post("/todoapi", function(req, res) {
    if (!checkHeader(req, res)) return;

    let newTodo = new Todo({
      input: req.body.input
    });

    // saving the instance
    newTodo.save(function(err, docs) {
      if (err) return console.log(err);

      res.json(docs);
    });
  });

  app.get("/todoapi", function(req, res) {
    if (!checkHeader(req, res)) return;

    Todo.find({}).exec(function(err, docs) {
      if (err) return console.log(err);

      res.json(docs);
    });
  });

  app.delete("/todoapi", function(req, res) {
    if (!checkHeader(req, res)) return;

    Todo.findByIdAndDelete(req.body.id, function(err, docs) {
      if (err) return console.log(err);
      res.json(docs);
    });
  });
});

// listen for requests :)
const listener = app.listen(process.env.PORT, function() {
  console.log("Your app is listening on port " + listener.address().port);
});
