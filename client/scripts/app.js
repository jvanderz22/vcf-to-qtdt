var app = angular.module('vcfApp',['angularFileUpload']);


app.config(function($routeProvider, $httpProvider) {
 // delete $httpProvider.defaults.headers.common["X-Requested-With"];
  $routeProvider
    .when('/', {
      redirectTo: 'Upload'
    })
    .when('/Upload', {
    	controller: 'UploadController',
    	templateUrl: 'partials/upload.html',

    })
    .when('/defineSamples', {
    	controller: 'DefineSamplesController',
    	templateUrl: 'partials/defineSamples.html'
    })
    .when('/downloadFiles', {
    	controller: 'DownloadController',
    	templateUrl: 'partials/download.html'
    })
    .when('/fileExample', {
        templateUrl: 'partials/fileExample.html'
    })
    .when('/penetranceCalculator', {
        controller: 'PenetranceController',
        templateUrl: 'partials/penetranceCalculator.html'
    })
    .when('/createFreq', {
        controller: 'FrequencyController',
        templateUrl: 'partials/createFreq.html'
    })
    .when('/downloadFreq', {
        templateUrl: 'partials/downloadFreq.html'
    })
    .otherwise ({ redirectTo: '/' });
});



