angular.module('teamList')
  .service('BroadcastService', function($rootScope) {
    this.send = function(msg, data) {
      $rootScope.$broadcast(msg, data);
    };
  });
