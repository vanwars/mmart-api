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
            templateUrl : "templates/create-new-art.html",
            controller: "CreateSite"
        })
        .when("/site/:siteID", {
            templateUrl : "templates/art-detail.html",
            controller: "EditSite"
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