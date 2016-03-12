angular.module('teamList')
  .directive('fileInput', ['$parse', 'HandlerService', function($parse, HandlerService) {
    return {
      restrict: 'A',
      link: function(scope, elem, attrs) {
        elem.bind('change', function() {
          console.log(elem[0].files[0].size);
          if (elem[0].files[0].size > 100000000) {
            HandlerService.handleError({err: 'the files\'s size must be under 100 Mb'});
            return elem[0].value = null;
          }
          $parse(attrs.fileInput)
            .assign(scope, elem[0].files);
          scope.$apply();
        });
      }
    };
  }]);
