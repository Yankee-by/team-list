var mongoose = require('mongoose');
var Schema = mongoose.Schema;



var notificationSchema = new Schema({
  receiver: String,
  purpose: String,
  itemId: String,
  type: String,
  important: Boolean,
  message: String,
  body: Object,
  time: {type: Date, default: Date.now}
});

mongoose.model('Notification', notificationSchema);
var Notification = mongoose.model('Notification');
var model = {};


model.createNewAsync = (mate, purpose, message, itemId, type) => new Promise((resolve, reject) => {
  var notification = new Notification({
    receiver: mate,
    purpose: purpose,
    itemId: itemId,
    message: message,
    type: type
  });
  notification.save((err, notification) => {
    if (err) {
      reject(err);
    }
    resolve(notification);
  });
});

model.getListNotifsByTypeAsync = (username, type) => new Promise((resolve, reject) => {
  Notification.find({
    receiver: username,
    type: type
  })
  .exec((err, data) => {
    if (err) {
      return reject(err);
    }
    if (!data) {
      return resolve([]);
    }
    // var result = {};
    // for (var i = 0, n = data.length; i < n; i++) {
    //   result[data[i]._id] = data[i];
    // }
    return resolve(data);
  })
});

model.removeNotifAsync = (username, query) => new Promise((resolve, reject) => {
  Notification.remove(query, function(err) {
    if(err) {
      return reject(err);
    }
    return resolve();
  })
});









module.exports = model;
