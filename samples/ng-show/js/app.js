var app = angular.module("modelsApp", []);
app.controller('myController', function MyController($scope) {
    'use strict';
    $scope.hidePanels = function () {
        $scope.p1 = false;
        $scope.p2 = false;
        $scope.p3 = false;
    };
    $scope.activateTab = function (e) {
        if (!e) {
            return;
        }
        $('li').removeClass('active');
        $(e.currentTarget).parent().addClass('active');
    };
    $scope.showPanel1 = function (e) {
        $scope.activateTab(e);
        $scope.hidePanels();
        $scope.p1 = true;
    };
    $scope.showPanel2 = function (e) {
        $scope.activateTab(e);
        $scope.hidePanels();
        $scope.p2 = true;
    };
    $scope.showPanel3 = function (e) {
        $scope.activateTab(e);
        $scope.hidePanels();
        $scope.p3 = true;
    };

    //initialize:
    $scope.showPanel1();
});
