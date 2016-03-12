angular.module('teamList')
  .directive('contenteditable', function() {
    return {
      restrict: 'A',
      require: 'ngModel',
      link: function(scope, element, attrs, ngModel) {
        function read() {
          ngModel.$setViewValue(element.html());
        }
        ngModel.$render = function() {
          element.html(ngModel.$viewValue || '');
        };

        element.bind('keyup change', onKeyUp);
        function onKeyUp(event) {
          scope.$apply(read);
        }

        element.bind('keydown keypress', onKeyPress);
        function onKeyPress(event) {
          var keyCode = event.which || event.keyCode;
          if (keyCode === 13) {
            event.preventDefault();
            scope[attrs['toggle']](event);
          }
        }

        element.bind('blur', onBlur);
        function onBlur(event) {
          scope.$apply(function(){scope[attrs['toggle']](event);});
          scope[attrs['edit']](attrs['elemid']);
        }

        element.on('$destroy', function() {
          element.unbind('blur', onBlur);
          element.unbind('keydown keypress', onKeyPress);
          element.unbind('keyup change', onKeyUp);
        });

      }
    };
  });
