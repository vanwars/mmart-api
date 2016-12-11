var app = angular.module("modelsApp", ['ngRoute']);
app.adminMode = true;
app.url = "https://mmart162-api.herokuapp.com/vanwars/artists/";
app.config(function ($routeProvider) {
    'use strict';
    $routeProvider
        .when("/", {
            templateUrl: "list.html",
            controller: "ListArtistController"
        })
        .when("/new/artist", {
            controller: "CreateArtistController",
            templateUrl: "detail-form.html"
        })
        .when("/artist/:modelId", {
            controller: "EditArtistController",
            templateUrl: "detail.html"
        })
        .otherwise({
            redirectTo: "/"
        });
});