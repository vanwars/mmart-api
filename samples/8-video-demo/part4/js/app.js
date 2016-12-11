var app = angular.module("myApp", ["ngRoute"]);
var url = "https://mmart162-api.herokuapp.com/vanwars/public-art/";
app.config(function ($routeProvider) {
    'use strict';
    $routeProvider
        .when("/", {
            templateUrl : "templates/art-list.html",
            controller: "ListSites"
        })
        .when("/new/site", {
            templateUrl : "templates/art-form.html",
            controller: "CreateSite"
        })
        .when("/site/:siteID", {
            templateUrl : "templates/art-detail.html",
            controller: "SiteDetail"
        })
        .when("/photos/", {
            templateUrl : "templates/photo-list.html"
        })
        .when("/new/photo/", {
            templateUrl : "templates/photo-form.html"
        })
        .otherwise({
            redirectTo: "/"
        });
});

app.controller("ListSites", function($scope, $http) {
     $scope.sites = [];
     $scope.getData = function () {
          $http.get(url)
               .success(function (data) {
                    $scope.sites = data;
                    console.log(data);
               })
               .error(function (data) {
                    console.log(data);
                    alert("error");
               });
     };
     $scope.getData();

});

app.controller("SiteDetail", function($scope, $location, $routeParams, $http) {
    $scope.siteID = $routeParams.siteID;
    $scope.currentSite = null;

    $scope.getData = function () {
          $http.get(url + $scope.siteID + "/")
               .success(function (data) {
                    $scope.currentSite = data;
                    console.log(currentSite);
               })
               .error(function (data) {
                    console.log(data);
                    alert("error");
               });
     };
     $scope.getData();
});



app.controller("CreateSite", function($scope, $location, $http) {
    
     $scope.site = null;
     
     $scope.uploadData = function () {
          var fd = new FormData();
          fd.append("name", $scope.site.name);
          fd.append("contributors", $scope.site.contributors);
          fd.append("about", $scope.site.about);
          fd.append("type", $scope.site.type);
          fd.append("tags", $scope.site.tags);
          fd.append("year", $scope.site.year);
          fd.append("loc_desc", $scope.site.loc_desc);
          if ($scope.site.lat.length > 0 && $scope.site.lng.length > 0) {
              fd.append("lat", parseFloat($scope.site.lat));
              fd.append("lng", parseFloat($scope.site.lng));
          }
          $http.post(url, fd, {
                    headers: { 'Content-Type': undefined },
                    transformRequest: angular.identity
               }).success($scope.processSuccess)
               .error($scope.processError);
     };
     $scope.processSuccess = function (data) {
          $scope.site = data;
          console.log(data);
          alert("success");
          $location.path('#/');
     };
     $scope.processError = function (data) {
          console.log(data);
          alert("error");
     };

});