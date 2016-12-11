app.controller("ListArtistController", function ($scope, $http) {
    'use strict';
    $scope.adminMode = app.adminMode;
    $scope.url = app.url;
    $scope.getModels = function () {
        return $http.get($scope.url).
            then(function (response) {
                console.log(response);
                $scope.models = response.data;
            }, function (response) {
                console.log(response);
                alert("Error finding models.");
            });
    };
    $scope.getModels();
});