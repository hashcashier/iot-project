angular.module('userApp', [
	'ngAnimate',
	'app.routes',
	'authService',
	'mainCtrl'
])
.config(function($httpProvider) {
	// attach our auth interceptor to the http requests
	$httpProvider.interceptors.push('AuthInterceptor');
});
