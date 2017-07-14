const async = require('async');
const mongoose = require('./libs/mongoose');

mongoose.set('debug', true);

const open = (callback) => {
  mongoose.connection.on('open', callback);
};

const dropDatabase = (callback) => {
  const db = mongoose.connection.db;
  db.dropDatabase(callback);
};

const requireModels = (callback) => {
  require('./models/user');

  async.each(Object.keys(mongoose.models), (modelName, callback) => {
    mongoose.models[modelName].ensureIndexes(callback);
  }, callback);
};

const createUsers = (callback) => {
  const users = [
    { username: '1', password: 'password1' },
    { username: '2', password: 'password2' },
    { username: '3', password: 'password3' },
  ];

  async.each(users, (userData, callback) => {
    const user = new mongoose.models.User(userData);
    user.save(callback);
  }, callback);
};

async.series([
  open,
  dropDatabase,
  requireModels,
  createUsers,
], (err) => {
  mongoose.disconnect();
  console.log(err);
  process.exit(err ? 255 : 0);
});
