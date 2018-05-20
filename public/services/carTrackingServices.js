var appT = angular.module('carTrackingServices', []);

appT.service('jwt', function () {
    var jwt = '';

    this.setJwt = function (jwt) {
        jwt = jwt;
    };

    this.getJwt = function () {
        return jwt;
    };
});

