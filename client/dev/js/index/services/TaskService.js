angular.module('teamList')
.service('TaskService', ['$q', 'SocketService', '$state', '$http', '$rootScope', 'HandlerService',
  function($q, SocketService, $state, $http, $rootScope, HandlerService) {
    console.log('TaskService');

    var nameUpdateTimeoutToken,
        commentUpdateTimeoutToken,
        tasksSearchTimeoutToken,
        cachedTasks = {},
        that = this;
    this.tasks = {};
    this.searchMode = false;



    this.addTask = function(currentListId, newTaskName) {
      if (!newTaskName) {
        return;
      }
      SocketService.emit('addTask', {
        listId: that.currentListId,
        newTaskName: newTaskName
      }, function(data) {
        if (data.err) {
          return HandlerService.handleError(data.err);
        }
        that.tasks[data._id] = data;
        $rootScope.$apply();
      });
    };

    this.deleteTask = function(taskId, changeUrl) {
      var taskName = that.tasks[taskId].name;
      SocketService.emit('deleteTask', {
        taskId: taskId,
        taskName: taskName
      }, function(data) {
        if (data.err) {
          return HandlerService.handleError(data.err);
        }
        delete that.tasks[taskId];
        if (changeUrl) {
          $state.go('lists', {
            taskId: undefined
          }, {
            notify: false,
            reload: false
          });
        }
        $rootScope.$apply();
      });
    };

    this.selectTask = function(taskId, changeUrl) {
      if(taskId instanceof Object) {
        taskId = taskId._id;
      }
      if (!taskId) {
        return;
      }
      that.selectedTask = that.tasks[taskId];
      if (changeUrl) {
        $state.go('lists', {
          taskId: taskId
        }, {
          notify: false,
          reload: false
        });
      }
    };

    this.updateName = function(taskId) {
      clearTimeout(nameUpdateTimeoutToken);
      nameUpdateTimeoutToken = setTimeout(that.updateTask.bind(this, 'name', taskId), 1500);
    };

    this.updateComment = function() {
      clearTimeout(commentUpdateTimeoutToken);
      commentUpdateTimeoutToken = setTimeout(that.updateTask.bind(this, 'comment'), 1500);
    };

    this.updateCompleted = function(e, task) {
      e.stopPropagation();
      that.updateTask('completed', task);
    };

    this.addSubtask = function(newSubtaskName) {
      if (!newSubtaskName) {
        return;
      }
      that.selectedTask.subtasks.push({
        name: newSubtaskName,
        completed: false
      });
      that.updateTask('subtasks');
    };

    this.deleteSubtask = function(subtask) {
      var index = that.selectedTask.subtasks.indexOf(subtask);
      that.selectedTask.subtasks.splice(index, 1);
      that.updateTask('subtasks');

    };

    this.updateTask = function(propName, task) {
      if (typeof task === 'string') {
        task = that.tasks[task];
      }
      if (!task) {
        task = that.selectedTask;
      }
      var reqBody = {};
      reqBody[propName] = task[propName];
      SocketService.emit('editTask', {
        taskId: task._id,
        body: reqBody
      }, function(data) {
        if (data.err) {
          return HandlerService.handleError(data.err);
        }
        HandlerService.handleSuccess(data);
      });
    };

    this.uploadAttachment = function(e, files) {
      if (!files) {
        return;
      }
      var fd = new FormData();
      angular.forEach(files, function(file) {
        fd.append('file', file);
      });
      $http.post('/files/' + that.selectedTask._id, fd, {
          transformRequest: angular.identity,
          headers: {
            'Content-Type': undefined
          }
        })
        .success(function(data) {
          if(data.err) {
            return HandlerService.handleError(data.err);
          }
          e.target.reset();
          that.selectedTask.attachments.push(data);
          $rootScope.$apply();
        });
    };

    this.deleteAttachment = function(attachment) {
      SocketService.emit('deleteFile', {
        filename: attachment.filename
      }, function(data) {
        if (data.err) {
          return HandlerService.handleError(data.err);
        }
        that.selectedTask.attachments.splice(that.selectedTask.attachments.indexOf(attachment), 1);
        $rootScope.$apply();
      });
    };

    this.searchForTasks = function(query) {
      console.log(query);
      that.searchMode = true;
      clearTimeout(tasksSearchTimeoutToken);
      tasksSearchTimeoutToken = setTimeout(function() {
        SocketService.emit('searchForTasks', query, function(data) {
          if(data.err) {
            return HandlerService.handleError(data.err);
          }
          console.log(data);
          Object.assign(cachedTasks, that.tasks);
          for (var prop in that.tasks) {
            delete that.tasks[prop];
          }
          Object.assign(that.tasks, data);
          $rootScope.$apply();
        })
      }, 0)
    };

    this.stopSearching = function() {
      if (!that.searchMode) {
        return;
      }
      that.searchMode = false;
      for (var prop in that.tasks) {
        delete that.tasks[prop];
      }
      Object.assign(that.tasks, cachedTasks);
      cachedTasks = {};
      $rootScope.$apply();
    };


  }
]);
