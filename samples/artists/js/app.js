var app = angular.module("modelsApp", ['ngRoute']);
var adminMode = true;
//add router:
app.config(function ($routeProvider) {
    'use strict';
    $routeProvider
        .when("/", {
            templateUrl: "list.html",
            controller: "ListController",
            resolve: {
                models: function (Models) {
                    console.log('fetch models...');
                    return Models.getModels();
                }
            }
        })
        .when("/new/artist", {
            controller: "NewModelController",
            templateUrl: "detail-form.html"
        })
        .when("/artist/:modelId", {
            controller: "EditModelController",
            templateUrl: "detail.html"
        })
        .otherwise({
            redirectTo: "/"
        });
});

// All of the methods contained within the service method
// are in charge of getting, posting, putting, and deleting
// resources from the server:
app.service("Models", function ($http) {
    'use strict';
    this.url = "/vanwars/artists/";

    //this method gets all of the models from your endpoint:
    this.getModels = function () {
        return $http.get(this.url).
            then(function (response) {
                console.log(response);
                return response;
            }, function (response) {
                console.log(response);
                alert("Error finding models.");
            });
    };

    //this method creates a new model using POST:
    this.createModel = function (model) {
        var image = document.getElementById("image").files[0],
            fd = new FormData(),
            metadata = {
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
        return $http.post(this.url, fd, metadata).
            then(function (response) {
                return response;
            }, function (response) {
                console.log(response);
                alert("Error creating model.");
            });
    };

    // This method gets a single model, based on the model's _id:
    this.getModel = function (modelId) {
        var url = this.url + modelId;
        return $http.get(url).
            then(function (response) {
                return response;
            }, function (response) {
                console.log(response);
                alert("Error finding this model.");
            });
    };

    // This method updates a model:
    this.updateModel = function (model) {
        var url = this.url + model._id;
        console.log(model._id);
        return $http.put(url, model).
            then(function (response) {
                return response;
            }, function (response) {
                alert("Error editing this model.");
                console.log(response);
            });
    };

    // This method deletes a model:
    this.deleteModel = function (modelId) {
        var url = this.url + modelId;
        return $http.delete(url).
            then(function (response) {
                return response;
            }, function (response) {
                alert("Error deleting this model.");
                console.log(response);
            });
    };
});

//add controllers:
app.controller("ListController", function (models, $scope) {
    'use strict';
    $scope.adminMode = adminMode;
    $scope.models = models.data;
});

//add create model controller:
app.controller("NewModelController", function ($scope, $location, Models) {
    'use strict';
    $scope.adminMode = adminMode;
    $scope.back = function () {
        $location.path("#/");
    };

    $scope.saveModel = function (model) {
        Models.createModel(model).then(function (doc) {
            console.log(doc);
            $location.path("#/");
        }, function (response) {
            alert(response);
        });
    };
});

//add edit model controller:
app.controller("EditModelController", function ($scope, $routeParams, Models) {
    'use strict';
    $scope.adminMode = adminMode;
    $scope.initialize = function () {
        Models.getModel($routeParams.modelId).then(function (doc) {
            $scope.model = doc.data;
            if ($scope.model.dob) {
                $scope.model.dob = new Date($scope.model.dob);
            }
        }, function (response) {
            alert(response);
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

    $scope.saveModel = function (model) {
        Models.updateModel(model);
        $scope.editMode = false;
        $scope.modelFormUrl = "";
    };

    $scope.deleteModel = function (modelId) {
        Models.deleteModel(modelId).then(function () {
            // once the model has been deleted, redirect to the
            // list page:
            window.location = "#/";
        });
    };

    //call the initialize method:
    $scope.initialize();
});