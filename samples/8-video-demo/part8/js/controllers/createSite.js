app.controller("CreateSite", function($scope, $location, $http) {
    
     $scope.site = {};
     $scope.formURL = "templates/art-form.html";
     
     $scope.save = function () {
          var fd = new FormData();
          fd.append("name", $scope.site.name);
          fd.append("contributors", $scope.site.contributors);
          fd.append("about", $scope.site.about);
          fd.append("type", $scope.site.type);
          fd.append("tags", $scope.site.tags);
          fd.append("year", $scope.site.year);
          fd.append("loc_desc", $scope.site.loc_desc);
          if ($scope.site.lat && $scope.site.lng) {
              fd.append("lat", parseFloat($scope.site.lat));
              fd.append("lng", parseFloat($scope.site.lng));
          }
          $http.post(url, fd, {
                    headers: { 'Content-Type': undefined },
                    transformRequest: angular.identity
               }).success($scope.processSuccess)
               .error($scope.processError);
     };
     $scope.processSuccess = function (data) {
          $scope.site = data;
          console.log(data);
          alert("success");
          $location.path('#/');
     };
     $scope.processError = function (data) {
          console.log(data);
          alert("error");
     };

});