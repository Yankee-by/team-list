angular.module('teamList')
.controller('MainCtrl', ['UserService', '$scope', '$location', '$http', '$stateParams', 'NotifService', MainCtrl]);
function MainCtrl(UserService, $scope, $location, $http, $stateParams, NotifService) {
  console.log('mainctrl');
  $scope.pendingUrlParamListId = $stateParams.listId;
  $scope.pendingUrlParamTaskId = $stateParams.taskId;
  $scope.user = UserService.user;
  $scope.notifs = NotifService.notifs;
  $scope.removeAllNotifs = NotifService.removeAllNotifs;
  $scope.removeNotif = function(e, notifId) {
    e.stopPropagation();
    NotifService.removeNotifById(notifId);
  };

  UserService.downloadUser();

  $scope.toggleAllowSharing = UserService.toggleAllowSharing;
}
