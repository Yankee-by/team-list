/*

securityLvl is a security level

1 - only author allowed to use the list
2 - author and watchers are allowed
//3 - author, watchers and collaborators


*/

var mongoose = require('mongoose');
var Schema = mongoose.Schema;



var listSchema = new Schema({
  name: String,
  author: String,
  watchers: [String],
  tasks: [{
    type: Schema.Types.ObjectId,
    ref: 'Task'
  }]
});

mongoose.model('List', listSchema);
var List = mongoose.model('List');
var model = {};

model.getListsForUser = (username) => new Promise((resolve, reject) => {
  List.find({
      $or: [{
        'author': username
      }, {
        'watchers': username
      }]
    })
  .exec((err, data) => {
    if (err) {
      return reject(err);
    }
    if (!data) {
      return resolve({});
    }
    var result = {};
    for (var i = 0, n = data.length; i < n; i++) {
      result[data[i]._id] = data[i];
    }
    return resolve(result);
  })
});

model.getById = (username, listId, securityLvl) => new Promise((resolve, reject) => {
  List.findById(listId)
    .populate('tasks')
    .exec((err, data) => {
      if (err) {
        return reject(err);
      }
      if (!data) {
        return reject('no such list');
      }
      switch (securityLvl) {
        case 1:
          if (data.author !== username) {
            return reject('unathorized access')
          }
          break;
        case 2:
          if ((data.author !== username) && (data.watchers.indexOf(username) === -1)) {
            return reject('unathorized access')
          }
          break;
      }
      return resolve(data);
    });
});

model.getOne = (username, query, securityLvl) => new Promise((resolve, reject) => {
  List.findOne(query)
    .exec((err, data) => {
      if (err) {
        return reject(err);
      }
      if (!data) {
        return reject('no such list');
      }
      switch (securityLvl) {
        case 1:
          if (data.author !== username) {
            return reject('unathorized access')
          }
          break;
        case 2:
          if ((data.author !== username) && (data.watchers.indexOf(username) === -1)) {
            return reject('unathorized access')
          }
          break;
      }
      return resolve(data);
    });
});

model.createNew = (username, newListName) => new Promise((resolve, reject) => {
  if (typeof username !== 'string' || typeof newListName !== 'string') {
    return reject('call 911');
  }
  if (newListName.length > 100) {
    return reject('length of list\'s name can\'t exceed 100');
  }
  var newList = new List({
    author: username,
    name: newListName
  });
  newList.save((err, list) => {
    if (err) {
      return reject(err);
    }
    return resolve(list);
  });
});

model.edit = (username, listId, body) => new Promise((resolve, reject) => {
  List.findById(listId, function(err, list) {
    if (!list) {
      return reject('no such list')
    }
    if (err || list.author !== username) {
      return reject(err || 'unathorized access');
    }
    for (prop in body) {
      if (prop === '__v' || prop === '_id' || prop === 'author') {
        continue;
      }
      if (prop === 'name' && body[prop].length > 100) {
        return reject('length of list\'s name can\'t exceed 100');
      }
      list[prop] = body[prop];
    }
    list.save((err, list) => {
      if (err) {
        return reject(err);
      }
      return resolve(list);
    });
  });
});

model.update = (username, query, updateBody) => new Promise((resolve, reject) => {
  List.update(query, updateBody, {multi: true}, (err, numberAffected) => {
    if (err) {
      return reject(err);
    }
    resolve();
  });

});

model.delete = (username, listId) => new Promise((resolve, reject) => {
  model.getById(username, listId, 1)
  .then((list) => {
    list.remove((err) => {
      if (err) {
        return reject(err);
      }
      return resolve({
        ok: true
      });
    });
  }, (err) => {
    reject(err);
  })
});

model.save = (list) => new Promise((resolve, reject) => {
  list.save((err, list) => {
    if (err) {
      return reject(err);
    }
    return resolve(list)
  })
});


module.exports = model;
