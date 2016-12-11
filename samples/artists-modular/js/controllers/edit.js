app.controller("EditArtistController", function ($scope, $location, $routeParams, $http) {
    'use strict';
    $scope.adminMode = app.adminMode;
    $scope.url = app.url;
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