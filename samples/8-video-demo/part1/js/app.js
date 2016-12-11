var app = angular.module("myApp", ["ngRoute"]);
app.config(function ($routeProvider) {
    'use strict';
    $routeProvider
        .when("/", {
            templateUrl : "templates/art-list.html"
        })
        .when("/new/site", {
            templateUrl : "templates/art-form.html"
        })
        .when("/site/:siteID", {
            templateUrl : "templates/art-detail.html"
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