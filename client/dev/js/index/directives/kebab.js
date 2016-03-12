angular.module('teamList')
.directive('kebab', function($document) {
	return {
		restrict: "E",
		link: function(scope, elem, attr) {

			elem.bind('click', function(event) {
        event.stopPropagation();
				elem.toggleClass('dropdown-active');
				elem.addClass('active-recent');
			});

			$document.bind('click', function(event) {
        event.stopPropagation();
				// if(!elem.hasClass('active-recent')) {
				// 	elem.removeClass('dropdown-active');
				// }
				elem.removeClass('dropdown-active');
				elem.removeClass('active-recent');
			});

		}
	};
});
