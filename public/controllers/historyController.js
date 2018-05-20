var appT = angular.module('2ledger-sample-history', ['ngMaterial', 'ngRoute', 'historyServices', 'ngLocale', 'ui.bootstrap', 'ngTable']);

appT.controller('historyController', function ($scope, $http, $timeout, $rootScope, $route, $routeParams, $location) {

	$scope.$route = $route;
	$scope.$location = $location;
	$scope.$routeParams = $routeParams;

	var me = this;
	var escopo = $scope;

	$location.path("/main");
	$scope.$broadcast('showScreen');
});

appT.run(function ($rootScope) {
	$rootScope.$on('$routeChangeStart', function (event, next, prev) {
	})
});

appT.config(function ($routeProvider) {
	$routeProvider
		.when("/main", {
			templateUrl: "models/main/main.html",
		})
});
