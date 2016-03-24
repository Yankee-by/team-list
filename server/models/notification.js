var mongoose = require('mongoose');
var Schema = mongoose.Schema;



var notificationSchema = new Schema({
  receiver: String,
  purpose: String,
  listId: String,
  taskId: String,
  type: String,
  important: Boolean,
  message: String,
  body: Object,
  time: {type: Date, default: Date.now}
});
  /*
    purpose can be:

      listDeleted
      lIstUpdated
      listShared

      taskDeleted
      taskUpdated
      taskAdded



    type can be:
      task
      list
      //user
  */

mongoose.model('Notification', notificationSchema);
var Notification = mongoose.model('Notification');
var model = {};


model.createNewAsync = (mate, purpose, message, listId, type, taskId) => new Promise((resolve, reject) => {
  var notification = new Notification({
    receiver: mate,
    purpose: purpose,
    listId: listId,
    taskId: taskId,
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

model.getListNotifsForUserAsync = (username) => new Promise((resolve, reject) => {
  Notification.find({
    receiver: username
  })
  .exec((err, data) => {
    if (err) {
      return reject(err);
    }
    if (!data) {
      return resolve([]);
    }
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
