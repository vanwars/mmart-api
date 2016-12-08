var app = angular.module("modelsApp", ['ngRoute']);
var adminMode = false;
var url = "https://mmart162-api.herokuapp.com/vanwars/artists/";
//add router:
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

//add controllers:
app.controller("ListArtistController", function ($scope, $http) {
    'use strict';
    $scope.adminMode = adminMode;
    $scope.url = url;
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

//add create model controller:
app.controller("CreateArtistController", function ($scope, $location, $http) {
    'use strict';
    $scope.adminMode = adminMode;
    $scope.url = url;
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

//add edit model controller:
app.controller("EditArtistController", function ($scope, $location, $routeParams, $http) {
    'use strict';
    $scope.adminMode = adminMode;
    $scope.url = url;
    $scope.getModel = function () {
        var modelURL = $scope.url + $routeParams.modelId;
        return $http.get(modelURL).
            then(function (response) {
                console.log(response);
                $scope.model = response.data;
                if ($scope.model.dob) {
                    $scope.model.dob = new Date($scope.model.dob);
                }
            }, function (response) {
                console.log(response);
                alert("Error finding this model.");
            });
    };

    $scope.toggleEdit = function () {
        $scope.editMode = true;
        $scope.modelFormUrl = "detail-form.html";
    };

    $scope.back = function () {
        $scope.editMode = false;
        $scope.modelFormUrl = "";
    };

    $scope.updateModel = function (model) {
        var modelURL = $scope.url + model._id;
        return $http.put(modelURL, model).
            then(function (response) {
                console.log(response);
                $scope.editMode = false;
                $scope.modelFormUrl = "";
            }, function (response) {
                alert("Error editing this model.");
                console.log(response);
            });
    };

    $scope.deleteModel = function (modelId) {
        var modelURL = $scope.url + modelId;
        var areYouSure = confirm("Are you sure you want to delete this model?");
        if (!areYouSure) {
            return;
        }
        return $http.delete(modelURL).
            then(function (response) {
                console.log(response);
                $location.path("#/");
            }, function (response) {
                alert("Error deleting this model.");
                console.log(response);
            });
    };

    //call the initialize method:
    $scope.getModel();
});