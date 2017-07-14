const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const config = require('./config');
const log = require('./libs/log')(module);
const HttpError = require('./error').HttpError;
const session = require('express-session');
const mongoose = require('./libs/mongoose');

const users = require('./routes/users');

const app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(favicon(path.join(__dirname, 'public', 'favicon.png')));

app.use(logger('dev'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

const MongoStore = require('connect-mongo')(session);

app.use(session({
  resave: false,
  saveUninitialized: true,
  secret: 'secret',
  key: config.get('session:key'),
  cookie: config.get('session:cookie'),
  store: new MongoStore({ mongooseConnection: mongoose.connection }),
}));

app.use((req, res, next) => {
  req.session.numberOfVisits = req.session.numberOfVisits + 1 || 1;
  res.send(`Visitors ${req.session.numberOfVisits}`);
});

app.use(express.static(path.join(__dirname, 'public')));

app.use(require('./middleware/sendHttpError'));

app.use('/users', users);

app.use((err, req, res, next) => {
  if (typeof err === 'number') err = new HttpError(err);
  if (err instanceof HttpError) {
    res.sendHttpError(err);
  } else if (app.get('env') === 'development') {
    log.error(err);
    err = new HttpError(500);
    res.sendHttpError(err);
  } else if (app.get('env') === 'production') {
    log.error(err);
    err = new HttpError(500);
    res.sendHttpError(err);
  }
});

module.exports = app;
