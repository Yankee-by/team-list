var teamList = angular.module('teamList', ['ui.router']);

teamList.config(function ($stateProvider, $urlRouterProvider) {
    $stateProvider
        .state('lists', {
            url: '/lists/:listId?/:taskId?',
            templateUrl: 'partials/lists.html',
            controller: 'MainCtrl',
            reloadOnSearch: false
        });

    $urlRouterProvider.otherwise('/lists/');
});
