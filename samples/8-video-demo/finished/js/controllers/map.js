L.mapbox.accessToken = 'pk.eyJ1IjoidmFud2FycyIsImEiOiIxaUNQOHVNIn0.NG-6iXCJsn5YLBVYPxboKA';
app.controller("Map", function($scope, $http) {
     $scope.sites = [];
     $scope.photos = [];
     $scope.map = null;
     $scope.activeSiteID = -1;
     $scope.getData = function () {
          $http.get(url)
               .success($scope.drawMap)
               .error(function (data) {
                    console.log(data);
                    alert("error");
               });
     };

     $scope.getPhotos = function () {
          $http.get(urlPhotos)
               .success(function (data) {
                    $scope.photos = data;
                    console.log(data);
               })
               .error(function (data) {
                    console.log(data);
                    alert("error");
               });
     };


     $scope.drawMap = function (data) {
          $scope.sites = data;
          console.log(data);
          for (var i = 0; i < $scope.sites.length; i++) {
               var site = $scope.sites[i];
               var coordinates = [parseFloat(site.lat), parseFloat(site.lng)]
               var marker = L.marker(coordinates);
               marker.bindPopup(site.loc_desc);
               marker.site_id = site._id;
               marker.addTo($scope.map);
               marker.on('click', function (e) {
                    console.log(e.target.site_id);
                    $scope.showPhotos(e.target.site_id);
               });
          }
     };

     $scope.showPhotos = function (id) {
          $scope.activeSiteID = id;
          $scope.$apply();//"activeSiteID", id);
     };

     $scope.map = L.mapbox.map('map', 'mapbox.light').setView([37.870194, -122.284556], 13);
     $scope.getData();
     $scope.getPhotos();

});