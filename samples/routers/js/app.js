//See: http://www.w3schools.com/angular/angular_routing.asp
var app = angular.module("myApp", ["ngRoute"]);
app.config(function ($routeProvider) {
    'use strict';
    $routeProvider
        .when("/", {
            templateUrl : "templates/p1.html"
        })
        .when("/panel1", {
            templateUrl : "templates/p1.html"
        })
        .when("/panel2", {
            templateUrl : "templates/p2.html"
        })
        .when("/panel3", {
            templateUrl : "templates/p3.html"
        });
});

/*
 * Note: the controller only controls the tabs (optional, for
 * cosmetic purposes only. However a controller is not required)
 */
app.controller('myController', function MyController($scope) {
    'use strict';
    $scope.highlight = function (e) {
        if (!e) {
            return;
        }
        $('li').removeClass('active');
        $(e.currentTarget).parent().addClass('active');
    };
});
