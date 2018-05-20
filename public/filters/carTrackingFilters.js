var appF = angular.module('carTrackingFilters', []);

appF.filter("formatDataTimeline", function () {
    return function (valor) {
        var str = new Date(valor * 1000).toString()
        return str;
    }
});
