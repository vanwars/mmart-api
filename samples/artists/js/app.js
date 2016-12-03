var app = angular.module("artistsApp", ['ngRoute']);

//add router:
app.config(function ($routeProvider) {
    'use strict';
    $routeProvider
        .when("/", {
            templateUrl: "list.html",
            controller: "ListController",
            resolve: {
                artists: function (Artists) {
                    return Artists.getArtists();
                }
            }
        })
        .when("/new/artist", {
            controller: "NewArtistController",
            templateUrl: "artist-form.html"
        })
        .when("/artist/:artistId", {
            controller: "EditArtistController",
            templateUrl: "artist.html"
        })
        .otherwise({
            redirectTo: "/"
        });
});

// All of the methods contained within the service method
// are in charge of getting, posting, putting, and deleting
// resources from the server:
app.service("Artists", function ($http) {
    'use strict';
    this.url = "/vanwars/artists/";
    this.getArtists = function () {
        return $http.get(this.url).
            then(function (response) {
                return response;
            }, function (response) {
                console.log(response);
                alert("Error finding artists.");
            });
    };
    this.createArtist = function (artist) {
        var image = document.getElementById("image").files[0],
            fd = new FormData(),
            metadata = {
                headers: { 'Content-Type': undefined },
                transformRequest: angular.identity
            };
        fd.append("image", image);
        fd.append("name", artist.name);
        fd.append("genre", artist.genre);
        fd.append("dob", artist.dob);
        fd.append("dob", artist.birthplace);
        return $http.post(this.url, fd, metadata).
            then(function (response) {
                return response;
            }, function (response) {
                console.log(response);
                alert("Error creating artist.");
            });
    };
    this.getArtist = function (artistId) {
        var url = this.url + artistId;
        return $http.get(url).
            then(function (response) {
                return response;
            }, function (response) {
                console.log(response);
                alert("Error finding this artist.");
            });
    };
    this.editArtist = function (artist) {
        var url = this.url + artist._id;
        console.log(artist._id);
        return $http.put(url, artist).
            then(function (response) {
                return response;
            }, function (response) {
                alert("Error editing this artist.");
                console.log(response);
            });
    };
    this.deleteArtist = function (artistId) {
        var url = this.url + artistId;
        return $http.delete(url).
            then(function (response) {
                return response;
            }, function (response) {
                alert("Error deleting this artist.");
                console.log(response);
            });
    };
});

//add controllers:
app.controller("ListController", function (artists, $scope) {
    'use strict';
    $scope.artists = artists.data;
});

//add create artist controller:
app.controller("NewArtistController", function ($scope, $location, Artists) {
    'use strict';
    $scope.url = "/vanwars/artists/";
    $scope.back = function () {
        $location.path("#/");
    };

    $scope.saveArtist = function (artist) {
        console.log(artist);
        Artists.createArtist(artist).then(function (doc) {
            var artistUrl = $scope.url + doc.data._id;
            $location.path(artistUrl);
        }, function (response) {
            alert(response);
        });
    };
});

//add edit artist controller:
app.controller("EditArtistController", function ($scope, $routeParams, Artists) {
    'use strict';
    Artists.getArtist($routeParams.artistId).then(function (doc) {
        $scope.artist = doc.data;
        if ($scope.artist.dob) {
            $scope.artist.dob = new Date($scope.artist.dob);
        }
    }, function (response) {
        alert(response);
    });

    $scope.toggleEdit = function () {
        $scope.editMode = true;
        $scope.artistFormUrl = "artist-form.html";
    };

    $scope.back = function () {
        $scope.editMode = false;
        $scope.artistFormUrl = "";
    };

    $scope.saveArtist = function (artist) {
        Artists.editArtist(artist);
        $scope.editMode = false;
        $scope.artistFormUrl = "";
    };

    $scope.deleteArtist = function (artistId) {
        Artists.deleteArtist(artistId);
    };
});