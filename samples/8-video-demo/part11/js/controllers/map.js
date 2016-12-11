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


     $scope.drawMap = function (data) {
          $scope.sites = data;
          console.log(data);
          for (var i = 0; i < $scope.sites.length; i++) {
               var site = $scope.sites[i];
               var coordinates = [parseFloat(site.lat), parseFloat(site.lng)]
               var marker = L.marker(coordinates);
               marker.bindPopup(site.loc_desc);
               marker.addTo($scope.map);
          }
     };

     $scope.map = L.mapbox.map('map', 'mapbox.light').setView([37.807664, -122.291604], 10);
     $scope.getData();

});