var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var taskSchema = new Schema({
  author: String,
  name: String,
  listId: String,
  completed: Boolean,
  subtasks: [{
    name: String,
    completed: Boolean
  }],
  comment: String,
  attachments: [{
      name: String,
      filename: String
      // ,thumbnail: Boolean
    }]
});

mongoose.model('Task', taskSchema);
var Task = mongoose.model('Task');
var model = {};

model.find = (username, query) => new Promise((resolve, reject) => {
  Task.find({author: username, name: { "$regex": query, "$options": "i" }},
    function(err, res) {
      console.log(err, res, query, username);
      if (err) {
        return reject(err);
      }
      var result = {};
      for (var task of res) {
        result[task._id] = task;
      }
      return resolve(result);
    }
  );
});

model.getById = (username, taskId, securityLvl) => new Promise((resolve, reject) => {
  Task.findById(taskId, function(err, task) {
    if (!task) {
      return reject('no such task');
    }
    if (err || task.author !== username) {
      return reject(err || 'unathorized access');
    }
    return resolve(task);
  });
});

model.getOne = (username, query, securityLvl) => new Promise((resolve, reject) => {
  Task.findOne(query, function(err, task) {
    if (!task) {
      return reject('no such task');
    }
    if (err || task.author !== username) {
      return reject(err || 'unathorized access');
    }
    return resolve(task);
  });
});

model.save = (task) => new Promise((resolve, reject) => {
  task.save((err, task) => {
    if (err) {
      return reject(err);
    }
    return resolve(task);
  });

});

model.createNew = (username, taskName, listId) => new Promise((resolve, reject) => {
  if (typeof username !== 'string' || typeof taskName !== 'string' || typeof listId !== 'string') {
    return reject('call 911');
  }
  if (taskName.length > 100) {
    return reject('length of task\'s name can\'t exceed 100');
  }
  var newTask = new Task({
    author: username,
    name: taskName,
    listId: listId,
    completed: false
  });
  model.save(newTask)
    .then((task) => {
        return resolve(task);
      },
          (err) => reject(err))
});

model.edit = (username, taskId, body) => new Promise((resolve, reject) => {
    model.getById(username, taskId)
      .then((task) => {
        for (prop in body) {
          if (prop === '__v') {
            continue;
          }
          if (prop === 'subtasks' && body.subtasks.some((sbtsk) => sbtsk.name.length > 100)) {
            return reject('length of subtask\'s name can\'t exceed 100');
          }
          if (prop === 'name' && body[prop].length > 100) {
            return reject('length of task\'s name can\'t exceed 100');
          }
          task[prop] = body[prop];
        }
        model.save(task)
          .then((task) => resolve(task),
                (err) => reject(err))

      }, (err) => reject(err))
});

model.deleteById = (username, taskId) => new Promise((resolve, reject) => {

  model.getById(username, taskId)
    .then((task) => {
      var listId = task.listId;
      task.remove((err) => {
        if (err) {
          return reject(err);
        }
        return resolve(listId);
      });

    }, (err) => reject(err))
});

model.deleteByListId = (username, listId) => new Promise((resolve, reject) => {
  Task.remove({listId: listId, author: username}, function(err) {
    if(err) {
      return reject(err);
    }
    return resolve();
  })

});



module.exports = model;
