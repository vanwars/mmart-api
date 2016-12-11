app.controller("ListSites", function($scope, $http) {
     $scope.sites = [];
     $scope.getData = function () {
          $http.get(url)
               .success(function (data) {
                    $scope.sites = data;
                    console.log(data);
               })
               .error(function (data) {
                    console.log(data);
                    alert("error");
               });
     };
     $scope.getData();

});