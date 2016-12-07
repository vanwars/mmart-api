//See: http://www.w3schools.com/angular/angular_routing.asp
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

app.controller("panel1Ctrl", function ($scope, $http) {
    'use strict';
    $scope.title = "First Panel";
    $scope.icon = "fa-heart";
    $scope.artists = null;
    var url = "https://mmart162-api.herokuapp.com/vanwars/artists/";

    //this method gets all of the models from your endpoint:
    $scope.getModels = function () {
        return $http.get(url).success(function(data) {
            console.log(data);
            $scope.artists = data;
        });
    };
    $scope.getModels();
});

app.controller("panel2Ctrl", function ($scope) {
    'use strict';
    $scope.title = "Second Panel";
    $scope.icon = "fa-beer";
});

app.controller("panel3Ctrl", function ($scope) {
    'use strict';
    $scope.title = "Third Panel";
    $scope.icon = "fa-star";
});
