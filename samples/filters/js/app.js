var app = angular.module("modelsApp", []);
app.controller('myController', function MyController($scope, $http) {
    'use strict';
    $scope.doSearch = function () {
        $http.get("https://api.spotify.com/v1/search", {
            params: {
                q: $scope.searchTerm,
                type: "album"
            }
        }).success(function (data) {
            console.log(data);
            $scope.spotifyData = data;
        });
    };
});
