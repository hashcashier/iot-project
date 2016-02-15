angular.module('app.routes', ['ngRoute'])
	.config(function($routeProvider, $locationProvider) {
		$routeProvider
		// home page route
			.when('/', {
				templateUrl : 'index/views/pages/home.html'
			});
		// get rid of the hash in the URL
		$locationProvider.html5Mode(true);
	});