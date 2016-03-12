angular.module('teamList')
  .directive('angularRipple', function() {
    return {
      restrict: 'A',
      link: function(scope, element, attrs) {
        var x, y, size, offsets,
          func = function(e) {
            var ripple = this.querySelector('.angular-ripple');
            var eventType = e.type;
            // if (ripple === null) {
            if (!ripple) {
              ripple = document.createElement('span');
              ripple.className += ' angular-ripple';

              this.insertBefore(ripple, this.firstChild);

              if (!ripple.offsetHeight && !ripple.offsetWidth) {
                size = Math.max(element[0].offsetWidth, element[0].offsetHeight);
                ripple.style.width = size + 'px';
                ripple.style.height = size + 'px';
              }
            }

            ripple.className = ripple.className.replace(/ ?(animate)/g, '');

            if (eventType === 'mouseup') {
              x = e.pageX;
              y = e.pageY;
            } else if (eventType === 'touchend') {
              try {
                var origEvent;

                if (typeof e.changedTouches !== 'undefined') {
                  origEvent = e.changedTouches[0];
                } else {
                  origEvent = e.originalEvent;
                }

                x = origEvent.pageX;
                y = origEvent.pageY;
              } catch (e) {
                x = ripple.offsetWidth / 2;
                y = ripple.offsetHeight / 2;
              }
            }

            function getPos(element) {
              var de = document.documentElement;
              var box = element.getBoundingClientRect();
              var top = box.top + window.pageYOffset - de.clientTop;
              var left = box.left + window.pageXOffset - de.clientLeft;
              return {
                top: top,
                left: left
              };
            }

            offsets = getPos(element[0]);
            ripple.style.left = (x - offsets.left - size / 2) + 'px';
            ripple.style.top = (y - offsets.top - size / 2) + 'px';

            ripple.className += ' animate';
          };

        element.on('touchend mouseup', func);

        scope.$on('$destroy', function() {
          element.off('touchend mouseup', func);
        });
      }
    };
  });
