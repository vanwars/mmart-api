var app = angular.module("myApp", ["ngRoute"]);
var url = "https://mmart162-api.herokuapp.com/vanwars/public-art/";
var urlPhotos = "https://mmart162-api.herokuapp.com/vanwars/public-art-photos/";
app.config(function ($routeProvider) {
    'use strict';
    $routeProvider
        .when("/", {
            templateUrl : "templates/art-list.html",
            controller: "ListSites"
        })
        .when("/map", {
            templateUrl : "templates/map.html",
            controller: "Map"
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
        .when("/about", {
            templateUrl : "templates/about.html"
        })
        .otherwise({
            redirectTo: "/"
        });
});

app.controller("NavController", function ($scope, $http) {
    'use strict';
    $scope.select = function (e) {
        if (!e) {
            return;
        }
        var $elem = $(e.currentTarget);
        $('li').removeClass('active');
        $elem.parent().addClass('active');
    };
});

