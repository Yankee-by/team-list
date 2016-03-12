angular.module('teamList')
  .service('UserService', ['SocketService', '$q', '$rootScope', 'HandlerService',
    function(SocketService, $q, $rootScope, HandlerService) {
      this.user = {};
      var user = this.user;

      this.downloadUser = function() {
        SocketService.emit('getUser', {}, function(data) {
          if (data.err) {
            return HandlerService.handleError(data.err);
          }
          Object.assign(user, data);
          $rootScope.username = user.username;
        });
      };

      this.toggleAllowSharing = function(e) {
        e.stopPropagation();
        if (user.settings.allowSharing === false && confirm('remove all the lists that had already been shared with you?')) {
          SocketService.emit('stopWatchingLists', {}, function(data) {
            if (data.err) {
              return HandlerService.handleError(data.err);
            }
            HandlerService.handleSuccess(data);
          });
        }
        updateUserPreferences('allowSharing');
      };

      function updateUserPreferences(propName) {
        var reqBody = {};
        reqBody[propName] = user.settings[propName];
        SocketService.emit('changeUserSettings', {
          body: reqBody
        }, function(data) {
          if (data.err) {
            return HandlerService.handleError(data.err);
          }
          HandlerService.handleSuccess(data);
        });
      }
    }
  ]);
