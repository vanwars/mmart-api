var app = angular.module("myApp", ["ngRoute"]);
app.config(function ($routeProvider) {
    'use strict';
    $routeProvider
        .when("/", {
            templateUrl : "templates/p1.html",
            controller: "panel1Ctrl"
        })
        .when("/panel1", {
            templateUrl : "templates/p1.html",
            controller: "panel1Ctrl"
        })
        .when("/panel2", {
            templateUrl : "templates/p2.html",
            controller: "panel2Ctrl"
        })
        .when("/panel3", {
            templateUrl : "templates/p3.html",
            controller: "panel3Ctrl"
        });
});

/*
 * Note: the controller only controls the tabs (optional, for
 * cosmetic purposes only. However a controller is not required)
 */
app.controller('topController', function ($scope) {
    'use strict';
    $scope.highlight = function (e) {
        if (!e) {
            return;
        }
        $('li').removeClass('active');
        $(e.currentTarget).parent().addClass('active');
    };
});

app.controller("panel1Ctrl", function ($scope) {
    $scope.title = "First Panel";
    $scope.icon = "fa-heart";
});

app.controller("panel2Ctrl", function ($scope) {
    $scope.title = "Second Panel";
    $scope.icon = "fa-beer";
});

app.controller("panel3Ctrl", function ($scope) {
    $scope.title = "Third Panel";
    $scope.icon = "fa-star";
});
