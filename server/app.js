var express = require('express'),
  socketio = require('socket.io'),
  logger = require('morgan'),
  cookieParser = require('cookie-parser'),
  bodyParser = require('body-parser'),
  busboyBodyParser = require('busboy-body-parser'),
  mongoose = require('mongoose'),
  hash = require('bcrypt-nodejs'),
  path = require('path'),
  passport = require('passport'),
  session = require('express-session'),
  MongoStore = require('connect-mongo')(session),
  localStrategy = require('passport-local').Strategy;


var db = mongoose.connect('mongodb://localhost/team-list');

var User = require('./models/user.js').user;
var List = require('./models/list.js');
var task = require('./models/task.js');
var Notification = require('./models/notification.js');




var app = express();
var io = socketio();
app.io = io;
require('./controllers/socketApi.js')(io);


var mongoStore = new MongoStore({
  mongooseConnection: mongoose.connection
});

var sessionMiddleware = session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: false
  },
  store: mongoStore
});


app.use(express.static(path.join(__dirname, '../client/build')));
app.use(logger('dev'));
app.use(cookieParser('keyboard cat'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(busboyBodyParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(sessionMiddleware);
app.use(passport.initialize());
app.use(passport.session());

io.use(function (socket, next) {
  sessionMiddleware(socket.request, {}, next);
});
io.use(function (socket, next) {
  cookieParser('keyboard cat')(socket.request, {}, function (err) {
    var sessionId = socket.request.signedCookies['connect.sid'];

    mongoStore.get(sessionId, function (err, session) {
      socket.request.session = session;

      passport.initialize()(socket.request, {}, function () {
        passport.session()(socket.request, {}, function () {
          if (socket.request.user) {
            next(null, true);
          } else {
            next(new Error('User is not authenticated'), false);
          }
        })
      });
    });
  });
});



// configure passport
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(function (id, done) {
  User.findById(id, function (err, user) {
    done(err, user);
  });
});

app.set('views', '../client/build');
app.set('view engine', 'jade');

var routes = require('./controllers/httpApi.js')(io);
app.use('/', routes);


app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

app.use(function (err, req, res) {
  res.status(err.status || 500);
  res.end(JSON.stringify({
    message: err.message,
    error: {}
  }));
});

module.exports = app;
