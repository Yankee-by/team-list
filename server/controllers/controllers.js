var mongoose = require('mongoose');
var fs = require('fs');
var UserAuth = require('../models/user').user;
var User = require('../models/user').model;
var List = require('../models/list');
var Task = require('../models/task');
var gfs = require('../models/gridfs')(mongoose);
var Notification = require('../models/notification');
var passport = require('passport');

var ctrls;

function initCtrls(io) {
  ctrls = {

    requireLogin: (req, res, next) => {
      if (!req.user) {
        res.redirect('/login');
      } else {
        next();
      }
    },

    requireAngLogin: (req, res, next) => {
      if (!req.user) {
        return res.json({redirect: true});
      } else {
        next();
      }
    },

    index: (req, res) => {
      console.log('index');
      res.render('index')
    },

    login: (req, res) => {
      console.log('login');
      if (req.user) {
        return res.redirect('/');
      }
      res.render('login');
    },

    userLogin: (req, res) => {
      console.log('userLogin');
      passport.authenticate('local', (err, user, info) => {
        if (err) {
          return res.send({err: err.message});
        }
        if (!user) {
          return res.send({err: 'invalid username or password'});
        }
        req.logIn(user, (err) => {
          if (err) {
            return res.render('login', {err: err});
          }
          return res.sendStatus(302);
        });
      })(req, res)
    },

    register: (req, res) => {
      console.log('register');
      var username = req.body.username,
          password = req.body.password;
      UserAuth.register(new UserAuth({
        username: username,
        settings: {
          allowSharing: false
        }
      }), password, (err, account) => {
        if (err) {
          return res.json({err: err.message});
        }
        passport.authenticate('local')(req, res, () =>
          res.sendStatus(302)
        );
      })
    },

    logout: (req, res) => {
      console.log('logout');
      req.logout();
      req.session.destroy((err) => res.redirect('/login'));
    },

    getUser: (user, socket, data, fn) => {
      console.log('getUser', data);
      var username = user.username
      User.findOne({
        username: username
      })
        .then((data) => fn(data))
        .catch((err) => fn({err: err}));
    },

    enterRooms: (user, socket) => {
      console.log('enterRooms');
      var username = user.username;
      List.getListsForUser(username)
        .then((data) => {
          for (prop in data) {
            socket.join(prop);
          }
          socket.join(username);
        })
    },

    getListsNotifs: (user, socket, data, fn) => {
      console.log('getListsNotifs', data);
      var username = user.username;
      Notification.getListNotifsByTypeAsync(username, 'list')
        .then((data) => {
          fn(data);
        })
        .catch((err) => fn({err: err}));
    },

    removeNotif: (user, socket, data, fn) => {
      console.log('removeNotif', data);
      var username = user.username;
      var body = data;
      body.receiver = username;
      Notification.removeNotifAsync(username, body)
        .then((data) => {
          fn({ok: true});
        })
        .catch((err) => fn({err: err}));
    },

    stopWatchingLists: (user, socket, data, fn) => {
      console.log('stopWatchingLists', data);
      var username = user.username;
      List.update(username, {
        watchers: username
      }, {
        $pull: {
          watchers: username
        }
      })
        .then((data) => {
          socket.emit('sharedListsDeleted', {});
          fn({ok: true});
      })
        .catch((err) => fn({err: err}));
    },

    changeUserSettings: (user, socket, data, fn) => {
      console.log('changeUserSettings', data);
      var username = user.username,
          body = data.body;
      User.changeSettings({
        username: username
      }, body)
        .then((data) => fn(data))
        .catch((err) => fn({err: err}));
    },

    getLists: (user, socket, data, fn) => {
      console.log('getLists', data);
      var username = user.username;
      List.getListsForUser(username)
        .then((data) => fn(data))
        .catch((err) => fn({err: err}));
    },

    getList: (user, socket, data, fn) => {
      console.log('getList', data);
      var username = user.username;
      var listId = data.listId;
      List.getById(username, listId, 2)
        .then((data) => fn(data))
        .catch((err) => fn({err: err}));
    },

    addList: (user, socket, data, fn) => {
      console.log('addList', data);
      var username = user.username;
      var newListName = data.newListName;
      List.createNew(username, newListName)
        .then((data) => fn(data))
        .catch((err) => fn({err: err}));
    },

    editList: (user, socket, data, fn) => {
      console.log('editList', data);
      var username = user.username;
      var listId = data.listId;
      var body = data.body;
      List.edit(username, listId, body)
        .then((list) => {
          console.log(list.watchers);
          var message = username + ' edited list ' + list.name;
          for (watcher of list.watchers) {
            Notification.createNewAsync(watcher, 'listUpdated', message, listId, 'list')
              .then((notif) => {
                socket.broadcast.in(watcher).emit('listUpdated', {
                  listId: listId,
                  body: body,
                  notif: notif
                })
              }, (err) => fn({err: err}));
          }
          return true;
        })
        .then(() => fn({ok: true}))
        .catch((err) => fn({err: err}))
    },

    deleteList: (user, socket, data, fn) => {
      console.log('deleteList', data);
      var username = user.username;
      var listId = data.listId;
      List.delete(username, listId)
        .then((data) => data)
        .then(() => Task.deleteByListId(username, listId))
        .then(() => gfs.findAndRemoveAsync({'parentListId': listId}))
        .then(() => socket.broadcast.in(listId).emit('listDeleted', {
          listId: listId
          //todo wtf is goin on
          // ,          notif: notif
        }))
        .then(() => fn({ok: true}))
        .catch((err) => fn({err: err}))
    },

    shareList: (user, socket, data, fn) => {
      console.log('shareList', data);
      var username = user.username;
      var listId = data.listId;
      var mate = data.mate;
      var list;
      var _ok = true;
      List.getById(username, listId, 1)
        .then((data) => {
          list = data;
          return list;
        })
        .then((list) => {
          return User.findOne({username: mate})
        })
        .then((user) => {
          if (!user.settings.allowSharing) {
            _ok = false;
            return fn({err: 'the user doesn\'t allow sharing with them'});
          }
          if (list.watchers.indexOf(mate) !== -1) {
            _ok = false;
            return fn({err: 'you\'ve already shared this list with this user'});
          }
          list.watchers.push(mate);
          return List.save(list);
        })
        .then((list) => {
          var message = username+' shared list '+list.name+' with you';
          if(!_ok) {
            return;
          }
          return Notification.createNewAsync(mate, 'listShared', message, listId, 'list');
        })
        .then((notif) => {
          if(!_ok) {
            return;
          }
          return socket.broadcast.in(mate).emit('listShared', {
            name: list.name,
            _id: listId,
            notif: notif
          });
        })
        .then(() => fn({ok: true}))
        .catch((err) => fn({err: err}))
    },

    enterListRoom: (user, socket, data, fn) => {
      console.log('enterListRoom', data);
      var username = user.username;
      var listId = data.listId;
      socket.join(listId);
    },

    addTask: (user, socket, data, fn) => {
      console.log('addTask', data);
      var username = user.username;
      var listId = data.listId;
      var newTaskName = data.newTaskName;
      var list;
      var task;

      List.getById(username, listId, 1)
        .then((data) => {
          list = data;
          return Task.createNew(username, newTaskName, listId);
        })
        .then((data) => {
          task = data;
          list.tasks.push(task._id);
          return List.save(list);
        })
        .then(() => {
          var message = username+' added task '+ newTaskName+' to '+list.name;
          for (watcher of list.watchers) {
            Notification.createNewAsync(watcher, 'listUpdated', message, list._id, 'list')
            .then((notif) => {
              socket.broadcast.in(watcher).emit('listUpdated', {
                listId: _listId,
                notif: notif
              });
            })
          }
        })
        .then((data) => fn(task))
        .catch((err) => fn({err: err}));
    },

    searchForTasks: (user, socket, data, fn) => {
      console.log('searchForTasks', data);
      var username = user.username;
      var query = data;
      Task.find(username, query)
        .then((res) => fn(res))
        .catch((err) => fn({err: err}));
    },

    editTask: (user, socket, data, fn) => {
      console.log('editTask', data);
      var username = user.username;
      var taskId = data.taskId;
      var body = data.body;
      Task.edit(username, taskId, body)
        .then(() => fn({ok: true}))
        .catch((err) => fn({err: err}));
    },

    deleteTask: (user, socket, data, fn) => {
      console.log('deleteTask', data);
      var username = user.username;
      var taskId = data.taskId
      var taskName = data.taskName;
      var _listId;
      Task.deleteById(username, taskId)
        .then((listId) => {
          _listId = listId;
          return List.update(username, {
              _id: listId
            }, {
              $pull: {
                'tasks': taskId
              }
          })
        })
        .then(() => {
          return List.getById(username, _listId, 2);
        })
        .then((list) => {
          var message = username+' removed task '+taskName+' from '+list.name;
          for (watcher of list.watchers) {
            Notification.createNewAsync(watcher, 'listUpdated', message, list._id, 'list')
            .then((notif) => {
              socket.broadcast.in(watcher).emit('listUpdated', {
                listId: _listId,
                notif: notif
              });
            })
          }
        })
        .then(() => gfs.findAndRemoveAsync({'metadata.parentTaskId': taskId}))
        .then(() => fn({ok: true}))
        .catch((err) => fn({err: err}));
    },

    deleteFile: (user, socket, data, fn) => {
      console.log('deleteFile', data);
      var username = user.username;
      var filename = data.filename;
      var taskId;

      gfs.findOneAsync({filename: filename})
      .then((file) => {
        console.log(file);
        taskId = file.metadata.parentTaskId;
        return gfs.removeAsync(file);
      })
      .then(() => {
        return Task.getById(username, taskId)
      })
      .then((task) => {
        for (prop in task.attachments) {
          if (task.attachments[prop].filename === filename) {
            task.attachments.splice(prop, 1);
          }
        }
        return Task.save(task)
      })
      .then(() => fn({ok: true}))
      .catch((err) => fn({err: err}));
    },

    getFileByFilename: (req, res) => {
      console.log('getFileByFilename');
      var username = req.user.username,
          filename = req.params.filename;
      gfs.download({filename: filename}, res);
    },

    addFileToTask: (req, res) => {
      console.log('addFileToTask');
      var username = req.user.username,
          taskId = req.params.taskId,
          listId = undefined,
          file = req.files.file,
          task = undefined;
      Task.getById(username, taskId)
      .then((task1) => {
        listId = task1.listId;
        task = task1;
        return gfs.uploadAsync(username, taskId, listId, file, req, res);
      })
      .then((savedFile) => {
        task.attachments.push({
          name: savedFile.metadata.name,
          filename: savedFile.filename
        });
        Task.save(task)
      })
      .catch((err) => res.json({err: err}));
    }


  };

  return ctrls;

}



module.exports = (socketio) => {
  return ctrls || initCtrls(socketio);
};
