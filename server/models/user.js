var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');

var userSchema = new Schema({
  username: {
    type: String,
    unique: true
  },
  settings: {
    allowSharing: Boolean
  }
});

userSchema.plugin(passportLocalMongoose);
var __userModel__ = mongoose.model('User', userSchema);
var User = mongoose.model('User');

var model = {};

model.register = User.register;

model.findOne = (query) => new Promise((resolve, reject) => {
  User.findOne(query).exec((err, data) => {
    if (err) {
      return reject(err);
    }
    if (!data) {
      return reject('there is no such user');
    }
    return resolve(data);
  })
})

model.changeSettings = (query, body) => new Promise((resolve, reject) => {
  User.findOne(query).exec((err, data) => {
    if (err) {
      return reject(err);
    }
    if (!data) {
      return reject();
    }
    for (prop in body) {
      if (prop === '__v' || prop === '_id' || !(prop in data.settings)) {
        continue;
      }
      data.settings[prop] = body[prop];
    }
    data.save((err, user) => {
      if (err) {
        return reject(err);
      }
      resolve({
        ok: true
      });
    });
  })
})




module.exports = {user: __userModel__, model: model};
