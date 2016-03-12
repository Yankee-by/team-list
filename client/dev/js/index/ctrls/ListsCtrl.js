angular.module('teamList')
.controller('ListsCtrl', ['$scope', '$location', 'ListService', ListsCtrl]);
function ListsCtrl($scope, $location, ListService) {
  console.log('listsctrl');
  var selectedList;
  $scope.lists = ListService.lists;

$scope.updateName = ListService.updateList.bind(null, 'name');
$scope.addList = function(e) {
  e.preventDefault();
  ListService.addList($scope.newListName);
  $scope.newListName = '';
};
$scope.selectList = function(list, changeUrl, keepNotifs) {
  if (selectedList === list) {
    return;
  }
  console.info('select list: ' + list.name);
  selectedList = list;
  ListService.selectList(list._id, changeUrl, keepNotifs);
};
$scope.isListSelected = function(list) {
  return selectedList === list;
};
$scope.deleteList = function(e, list) {
  console.info('delete list: ' + list.name);
  e.stopPropagation();
  ListService.deleteList(list._id, $scope.isListSelected(list));
};
$scope.shareList = function(e, list) {
  console.info('share list ' + list.name);
  e.stopPropagation();
  ListService.shareList(list._id);
};
$scope.updateList = function(propName, list) {
  ListService.updateList(propName, list);
};
$scope.toggleListNameEditMode = function(e, list) {
  e.stopPropagation();
  $scope.listNameEditMode = $scope.listNameEditMode === list ? null : list;
  if ($scope.listNameEditMode) {
    setTimeout(function() {
      var el = document.querySelector('[contenteditable="true"]');
      el.click();
      el.focus();
    }, 0);
  }
};

ListService.downloadListsAsync()
  .then(function() {
    if ($scope.pendingUrlParamListId) {
      $scope.selectList($scope.lists[$scope.pendingUrlParamListId], false, true);
      $scope.pendingUrlParamListId = undefined;
    }
  });

}
