angular.module('teamList')
.filter('reverseObject', function(){
 return function(input) {
    if (!angular.isObject(input)) return input;

    var array = [];
    for(var objectKey in input) {
        array.push(input[objectKey]);
    }
    array.reverse();
    return array;
 };
});
