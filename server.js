var express = require('express');
var app = express();

var mongoose = require('mongoose');

mongoose.connect('localhost', 'test');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback() {
  console.log('Connected to DB');
});


// Setup CORS related headers
var corsSettings = function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'origin, content-type, accept');
  // deal with OPTIONS method during a preflight request
  if (req.method === 'OPTIONS') {
    res.send(200);
  } else {
    next();
  }
}

app.use(express.bodyParser());
app.use(corsSettings);

// User Schema
var userSchema = mongoose.Schema({
  username: { type: String, required: true, unique: true },
  number: { type: String, required: true},
  name: {type: String, required: true}
});
  
var User  = mongoose.model('User', userSchema);

app.get('/contacts', listContacts);
app.post('/contacts', createContact);
app.delete('/contacts/:id', deleteContactById);
app.put('/contacts/:id', updateContactById);

function listContacts(req, res) {
  var options = {};
  if (req.query.skip) {
    options.skip = req.query.skip;
  }
  if (req.query.limit) {
    options.limit = req.query.limit;
  }
  User.find(null, null, options, function (err, docs) {
    if (err) {
      console.log(err);
      res.send(500, err);
    } else {
      res.send(200, docs);
    }
  });
}

function createContact(req, res) {
  User.create(req.body, function (err, doc) {
    if (err) {
      console.log(err);
      res.send(500, err);
    } else {
      res.send(200, doc);
    }
  });
}

function deleteContactById(req, res) {
  var id = req.params.id;
  User.findByIdAndRemove(id, function (err, doc) {
    if (err) {
      console.log(err);
      res.send(404, err);
    } else {
      res.send(200, doc);
    }
  })
}

function updateContactById(req, res) {
  var id = req.params.id;
  var newData = {
    name: req.body.name,
    number: req.body.number,
    username: req.body.username
  };
  User.findByIdAndUpdate(id, newData, function (err, doc) {
    if (err) {
      console.log(err);
      res.send(404, err);
    } else {
      res.send(200, doc);
    }
  });
}

app.listen(9090, function() {
  console.log('Express server listening on port 9090');
});

