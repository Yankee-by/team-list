angular.module('teamList')
  .service('NotifService', ['SocketService', 'HandlerService', '$rootScope',
    function(SocketService, HandlerService, $rootScope) {
      console.log('NotifService instantiated');
      this.notifs = {};
      var that = this;


      this.getListsNotifs = function() {
        SocketService.emit('getListsNotifs', {}, function(data) {
          if(data.err) {
            return HandlerService.handleError(data.err);
          }
          for (var notif of data) {
            if(that.lists[notif.itemId]) {
              that.lists[notif.itemId].notif = notif._id;
            }
            that.notifs[notif._id] = notif;
          }
          $rootScope.$apply();
        });
      };

      this.subscribeListOnNotif = function(notifName, callback) {
        SocketService.on(notifName, function(data) {
          if(data.notif) {
            that.notifs[data.notif._id] = data.notif;
            if (that.lists[data.notif.itemId]) {
              that.lists[data.notif.itemId].notif = data.notif._id;
            }
          }
          callback(data);
        });
      };

      this.removeNotifById = function(notifId) {
        removeNotif({_id: notifId});
        delete that.notifs[notifId];
      };

      this.removeItemNotifs = function(itemId) {
        var list = that.lists[itemId];
        list.notif = false;
        for (var notif in that.notifs) {
          if (that.notifs[notif].itemId === list._id) {
            delete that.notifs[notif];
          }
        }
        removeNotif({itemId: itemId});
      };

      this.removeAllNotifs = function(e) {
        e.stopPropagation();
        removeNotif({});
        for (var prop in that.notifs) {
          delete that.notifs[prop];
        }
        $rootScope.$apply();
      };

      function removeNotif(body) {
        SocketService.emit('removeNotif', body, function(data) {
          if(data.err) {
            return console.log('problems w/ removing notif ', data.err);
          }
          $rootScope.$apply();
        });

      }

    }]
  );
