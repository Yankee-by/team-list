angular.module('teamList')
.directive('taskSearch', ['TaskService', function (TaskService) {
    return {
      restrict: 'A',
      link: function(scope, element, attrs) {
        var input = element.find('input');
        var closeBtn = element.find('button');


        input.bind("keydown", onKeyPress);
        function onKeyPress(event) {
          var keycode = event.which || event.keyCode;
          if (keycode === 13) {
            event.preventDefault();
            input[0].blur();
          }
          if(input[0].value.length > 0) {
            setTimeout(function() {
              TaskService.searchForTasks(input[0].value);
            }, 0);
          } else if(input[0].value.length <= 0) {
            setTimeout(function() {
              TaskService.stopSearching();
            }, 0);
          }
        }

        closeBtn.bind('click', onClose);
        function onClose(event) {
          input[0].value = '';
          TaskService.stopSearching();
        }

        element.on('$destroy', function() {
          input.unbind('keydown keypress', onKeyPress);
          closeBtn.unbind('click', onClose);
        });

      }
    };
}]);
