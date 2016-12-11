app.controller("EditSite", function($scope, $location, $routeParams, $http) {
    $scope.siteID = $routeParams.siteID;
    $scope.currentSite = null;
    $scope.formURL = null;
    $scope.viewMode = true;
    $scope.editMode = false;
    $scope.addPhotoMode = false;
    $scope.addPhotoFormURL = null;

    var detailURL = url + $scope.siteID + "/";
    $scope.getData = function () {
          $http.get(detailURL)
               .success(function (data) {
                    $scope.currentSite = data;
                    console.log($scope.currentSite);
               })
               .error(function (data) {
                    console.log(data);
                    alert("error");
               });
     };

     $scope.save = function () {
        $http.put(detailURL, $scope.site)
              .success(function (data) {
                $scope.formURL = "";
                $scope.viewMode = true;
         })
         .error(function (data) {
              console.log(data);
              alert("error");
         });
     };

     $scope.edit = function () {
        $scope.formURL = "templates/art-form.html";
        $scope.editMode = true;
        $scope.viewMode = false;
        $scope.addPhotoMode = false;
        $scope.site = $scope.currentSite;
     };

     $scope.view = function () {
        $scope.formURL = "";
        $scope.viewMode = true;
        $scope.editMode = false;
        $scope.addPhotoMode = false;
     };

     $scope.showPhotoForm = function () {
        $scope.addPhotoMode = true;
        $scope.viewMode = false;
        $scope.editMode = false;
        $scope.addPhotoFormURL = "templates/photo-form.html";
        alert($scope.addPhotoFormURL);
     };

     $scope.delete = function () {
        var areYouSure = confirm("Are you sure you want to delete this mural?");
        if (areYouSure) {
          $http.delete(detailURL)
               .success(function (data) {
                    $location.path('#/');
               })
               .error(function () {
                  alert("there was an error!!");
               });
        }
     };

     $scope.getData();
});