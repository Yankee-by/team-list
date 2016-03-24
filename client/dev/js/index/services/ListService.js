angular.module('teamList')
  .service('ListService', ['$q', '$timeout', 'SocketService', 'BroadcastService', '$state', '$rootScope', 'HandlerService', 'NotifService',
    function($q, $timeout, SocketService, BroadcastService, $state, $rootScope, HandlerService, NotifService) {
      console.info('list service');
      this.lists = {};
      NotifService.lists = this.lists;
      var that = this;

      this.downloadListsAsync = function() {
        return $q(function(resolve, reject) {
          SocketService.emit('getLists', {}, function(data) {
            if (data.err) {
              HandlerService.handleError(data.err);
              return reject();
            }
            Object.assign(that.lists, data);
            NotifService.getListsNotifs();
            // $rootScope.$apply();
            return resolve();
          });

        });
      };

      this.addList = function(newListName) {
        if (!newListName) {
          return;
        }
        SocketService.emit('addList', {
          newListName: newListName
        }, function(data) {
          if (data.err) {
            return HandlerService.handleError(data.err);
          }
          that.lists[data._id] = data;
          $rootScope.$apply();
        });
      };

      this.selectList = function(id, changeUrl, keepNotifs) {
        that.selectedList = that.lists[id];
        SocketService.emit('getList', {
          listId: id
        }, function(data) {
          if (data.err) {
            return HandlerService.handleError(data.err);
          }
          if (changeUrl) {
            $state.go('lists', {
              listId: id,
              taskId: undefined
            }, {
              notify: false,
              reload: false
            });
          }
          BroadcastService.send('listSelected', data);
          if(!keepNotifs && that.lists[id].notif) {
            NotifService.removeItemNotifs(id);
          }
          $rootScope.$apply();
        });
      };

      this.deleteList = function(id, resetUrl) {
        if (!confirm("are you sure you want to delete this list?")) {
          return;
        }
        SocketService.emit('deleteList', {
          listId: id
        }, function(data) {
          if (data.err) {
            return HandlerService.handleError(data.err);
          }
          delete that.lists[id];
          if (resetUrl) {
            $state.go('lists', {
              listId: undefined,
              taskId: undefined
            }, {
              notify: false,
              reload: false
            });
            resetTasks();
          }
          $rootScope.$apply();
        });
      };

      this.shareList = function(listId) {
        var mate = window.prompt('name of the user you want to share this list with');
        if (!mate) {
          return;
        }
        SocketService.emit('shareList', {
          listId: listId,
          mate: mate
        }, function(data) {
          if (data.err) {
            return HandlerService.handleError(data.err);
          }
          HandlerService.handleSuccess(data);
        });
      };

      this.updateList = function updateList(propName, list) {
        if (typeof list === 'string') {
          list = that.lists[list];
        }
        if (!list) {
          return;
        }
        var reqBody = {};
        reqBody[propName] = list[propName];
        SocketService.emit('editList', {
          listId: list._id,
          body: reqBody
        }, function(data) {
          if (data.err) {
            return HandlerService.handleError(data.err);
          }
          HandlerService.handleSuccess(data);
        });
      };

      NotifService.subscribeListOnNotif('listUpdated', function(data) {
        console.info('listUpdated');
        var list = that.lists[data.listId];
        Object.assign(list, data.body);
        $rootScope.$apply();
      });
      NotifService.subscribeListOnNotif('listShared', function(data) {
        console.info('listShared');
        that.lists[data._id] = data;
        SocketService.emit('enterListRoom', {listId: data._id});
        $rootScope.$apply();
      });
      NotifService.subscribeListOnNotif('listDeleted', function(data) {
        console.info('listDeleted');
        if (that.lists[data.listId]) {
          delete that.lists[data.listId];
        }
        $rootScope.$apply();
      });
      NotifService.subscribeListOnNotif('sharedListsDeleted', function(data) {
        //this one fires when user removes all the lists that has been shared w/ them
        console.info('sharedListsDeleted');
        var username = $rootScope.username;
        for (var list in that.lists) {
          if (that.lists[list].author !== username) {
            delete that.lists[list];
          }
        }
        $rootScope.$apply();
      });

      function resetTasks() {
        BroadcastService.send('listSelected', {tasks: []});
      }

    }
  ]);
