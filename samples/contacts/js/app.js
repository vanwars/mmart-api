var app = angular.module("contactsApp", ['ngRoute']);

//add router:
app.config(function ($routeProvider) {
    'use strict';
    $routeProvider
        .when("/", {
            templateUrl: "list.html",
            controller: "ListController",
            resolve: {
                contacts: function (Contacts) {
                    return Contacts.getContacts();
                }
            }
        })
        .when("/new/contact", {
            controller: "NewContactController",
            templateUrl: "contact-form.html"
        })
        .when("/contact/:contactId", {
            controller: "EditContactController",
            templateUrl: "contact.html"
        })
        .otherwise({
            redirectTo: "/"
        });
});

// All of the methods contained within the service method
// are in charge of getting, posting, putting, and deleting
// resources from the server:
app.service("Contacts", function ($http) {
    'use strict';
    this.url = "/vanwars/contacts/";
    this.getContacts = function () {
        return $http.get(this.url).
            then(function (response) {
                return response;
            }, function (response) {
                console.log(response);
                alert("Error finding contacts.");
            });
    };
    this.createContact = function (contact) {
        return $http.post(this.url, contact).
            then(function (response) {
                return response;
            }, function (response) {
                console.log(response);
                alert("Error creating contact.");
            });
    };
    this.getContact = function (contactId) {
        var url = this.url + contactId;
        return $http.get(url).
            then(function (response) {
                return response;
            }, function (response) {
                console.log(response);
                alert("Error finding this contact.");
            });
    };
    this.editContact = function (contact) {
        var url = this.url + contact._id;
        console.log(contact._id);
        return $http.put(url, contact).
            then(function (response) {
                return response;
            }, function (response) {
                alert("Error editing this contact.");
                console.log(response);
            });
    };
    this.deleteContact = function (contactId) {
        var url = this.url + contactId;
        return $http.delete(url).
            then(function (response) {
                return response;
            }, function (response) {
                alert("Error deleting this contact.");
                console.log(response);
            });
    };
});

//add controllers:
app.controller("ListController", function (contacts, $scope) {
    'use strict';
    $scope.contacts = contacts.data;
});

//add create contact controller:
app.controller("NewContactController", function ($scope, $location, Contacts) {
    'use strict';
    $scope.url = "/vanwars/contacts/";
    $scope.back = function () {
        $location.path("#/");
    };

    $scope.saveContact = function (contact) {
        console.log(contact);
        Contacts.createContact(contact).then(function (doc) {
            var contactUrl = $scope.url + doc.data._id;
            $location.path(contactUrl);
        }, function (response) {
            alert(response);
        });
    };
});

//add edit contact controller:
app.controller("EditContactController", function ($scope, $routeParams, Contacts) {
    'use strict';
    Contacts.getContact($routeParams.contactId).then(function (doc) {
        $scope.contact = doc.data;
    }, function (response) {
        alert(response);
    });

    $scope.toggleEdit = function () {
        $scope.editMode = true;
        $scope.contactFormUrl = "contact-form.html";
    };

    $scope.back = function () {
        $scope.editMode = false;
        $scope.contactFormUrl = "";
    };

    $scope.saveContact = function (contact) {
        Contacts.editContact(contact);
        $scope.editMode = false;
        $scope.contactFormUrl = "";
    };

    $scope.deleteContact = function (contactId) {
        Contacts.deleteContact(contactId);
    };
});