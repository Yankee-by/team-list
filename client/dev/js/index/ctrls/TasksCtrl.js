angular.module('teamList')
.controller('TasksCtrl', ['TaskService', '$scope', '$location', '$stateParams', TasksCtrl]);
function TasksCtrl(TaskService, $scope, $location, $stateParams) {
  console.log('tasksCtrl');
  $scope.currentListId = '';
  $scope.selectedTask = undefined;
  $scope.taskNameEditMode = false;
  $scope.tasks = TaskService.tasks;
  $scope.taskFilterProp = '_id';

  $scope.updateName = TaskService.updateName;
  $scope.updateComment = TaskService.updateComment;
  $scope.deleteSubtask = TaskService.deleteSubtask;
  $scope.changeTaskCompletedStatus = TaskService.updateCompleted;
  $scope.toggleShowOnlyCompleted = function() {
    $scope.taskFilterProp = $scope.taskFilterProp === 'completed'?'_id':'completed';
  };
  $scope.addTask = function(e) {
    e.preventDefault();
    TaskService.addTask($scope.currentListId, $scope.newTaskName);
    $scope.newTaskName = '';
  };
  $scope.deleteTask = function(e, task) {
    e.stopPropagation();
    TaskService.deleteTask(task._id, $scope.isTaskSelected(task));
    if ($scope.isTaskSelected(task)) {
      $scope.selectedTask = null;
    }
  };
  $scope.selectTask = function(task, changeUrl) {
    if (typeof task === 'string') {
      $scope.selectedTask = $scope.tasks[task];
    } else if (task) {
      $scope.selectedTask = task;
    }
    TaskService.selectTask(task, changeUrl);
    console.log();
  };
  $scope.isTaskSelected = function(task) {
    return $scope.selectedTask === task;
  };
  $scope.addSubtask = function() {
    TaskService.addSubtask($scope.newSubtaskName);
    $scope.newSubtaskName = '';
  };
  $scope.changeSubtaskCompletedStatus = function() {
    TaskService.updateTask('subtasks');
  };
  $scope.filesChanged = function(elem) {
    $scope.files = elem.files;
    $scope.$apply();
  };
  $scope.uploadAttachment = function(e) {
    TaskService.uploadAttachment(e, $scope.files);
  };
  $scope.deleteAttachment = function(attachment) {
    TaskService.deleteAttachment(attachment);
  };
  $scope.toggleTaskNameEditMode = function(e, task) {
    e.stopPropagation();
    $scope.taskNameEditMode = $scope.taskNameEditMode === task ? null : task;
    if ($scope.taskNameEditMode) {
      setTimeout(function() {
        var el = document.querySelector('[contenteditable="true"]');
        el.click();
        el.focus();
      }, 0);
    }
  };

  $scope.$on('listSelected', function(event, args) {
    $scope.tasks = {};
    for (var task of args.tasks) {
      $scope.tasks[task._id] = task;
    }
    TaskService.tasks = $scope.tasks;
    $scope.currentListId = args._id;
    TaskService.currentListId = $scope.currentListId;
    $scope.selectedTask = null;
    if ($scope.pendingUrlParamTaskId) {
      $scope.selectTask($scope.pendingUrlParamTaskId, false);
      $scope.pendingUrlParamTaskId = '';
    }
    $scope.$apply();
  });

}
