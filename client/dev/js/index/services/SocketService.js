angular.module('teamList')
  .service('SocketService',
    function() {
      var socket = io();
      console.log('SocketService instantiated');
      this.emit = function(path, obj, callback) {
        socket.emit(path, obj, callback);
      };
      this.on = function(eventName, callback) {
        socket.on(eventName, callback);
      };
    }
  );
