app.controller("CreateArtistController", function ($scope, $location, $http) {
    'use strict';
    $scope.adminMode = app.adminMode;
    $scope.url = app.url;
    $scope.back = function () {
        $location.path("#/");
    };

    $scope.createModel = function (model) {
        var image = document.getElementById("image").files[0];
        var fd = new FormData();
        var metadata = {
            headers: { 'Content-Type': undefined },
            transformRequest: angular.identity
        };
        fd.append("image", image);
        fd.append("name", model.name);
        fd.append("genre", model.genre);
        fd.append("birthplace", model.birthplace);

        //some special logic for handling dates:
        var dob = Date.parse(model.dob);
        if (dob !== 'invalid date' && !isNaN(dob)) {
            fd.append("dob", dob);
        }

        //save to API with POST request:
        $http.post($scope.url, fd, metadata).then(function (response) {
            console.log(response);
            $location.path("#/");
        }, function (response) {
            console.log(response);
            alert("Error creating model.");
        });
    };
});