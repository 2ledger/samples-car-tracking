var appT = angular.module('2ledger-sample-car-tracking');

appT.controller('main', main)


appT.directive('draggable', function () {
    return function (scope, element) {
        // this gives us the native JS object
        var el = element[0];

        el.draggable = true;

        el.addEventListener(
            'dragstart',
            function (e) {
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('Text', this.id);
                scope.$emit('dragstart', this);
                this.classList.add('drag');
                return false;
            },
            false
        );

        el.addEventListener(
            'dragend',
            function (e) {
                scope.$emit('dragend', this);
                this.classList.remove('drag');
                return false;
            },
            false
        );
    }
});

appT.directive('droppable', function () {
    return {
        scope: {
            drop: '&',
            bin: '=',
        },
        link: function (scope, element) {
            // again we need the native object
            var el = element[0];

            el.addEventListener(
                'dragover',
                function (e) {
                    e.dataTransfer.dropEffect = 'move';
                    // allows us to drop
                    if (e.preventDefault) e.preventDefault();
                    this.classList.add('over');
                    return false;
                },
                false
            );

            el.addEventListener(
                'dragenter',
                function (e) {
                    this.classList.add('over');
                    return false;
                },
                false
            );

            el.addEventListener(
                'dragleave',
                function (e) {
                    this.classList.remove('over');
                    return false;
                },
                false
            );

            el.addEventListener(
                'drop',
                function (e) {
                    scope.$emit('droped', this);

                    // Stops some browsers from redirecting.
                    if (e.stopPropagation) e.stopPropagation();

                    this.classList.remove('over');

                    var binId = this.id;
                    var item = document.getElementById(e.dataTransfer.getData('Text'));
                    //this.appendChild(item);
                    // call the passed drop function
                    scope.$apply(function (scope) {
                        var fn = scope.drop();
                        if ('undefined' !== typeof fn) {
                            fn(item.id, binId);
                        }
                    });

                    return false;
                },
                false
            );
        }
    }
});

function main($scope, $http, $rootScope, $timeout, $filter, ngTableParams, $location, $anchorScroll) {

    var me = this;
    me.listParts = [];
    me.listAssets = [];
    me.objParts = {};
    me.showAddCar = false;

    me.nameCar = '';
    me.codeCar = '';
    me.photoCar = '';
    me.yearCar = '';
    me.doorsCar = '';
    me.priceCar = 100;

    me.namePart = '';
    me.zipCodePart = '';
    me.photoPart = '';
    me.typePart = '';

    me.textIncludePart = '';

    me.showAssetsFactory = true;
    me.showAssetsDealership = true;
    me.showAssetsStore = true;
    me.showAssetsClient = true;

    me.showDetailAssets = false;
    me.carSelected = {};
    me.carSelected.details = {}
    me.carSelected.details.history = [];
    
    me.showWaitingEdit = false;
    me.showWaiting = true;

    me.apiMapsKey = 'AIzaSyDE2zfjFQAyso_eXyZyN6NxG-igBx-vdZk';
    me.addressMaps = '';

    me.marks = [];
    me.lines = [];

    var setTempo;

    $('.cmpWaitingMaps').css({ display: 'none' });
    $('.error').css({ 'margin-top': '-300px' });
    $('.alert').css({ 'margin-top': '-300px' });

    me.qrcode = new QRCode("qrcode", { width: 100, height: 100, text: '' });

    function pinSymbol(color) {
        return {
            path: 'M 0,0 C -2,-20 -10,-22 -10,-30 A 10,10 0 1,1 10,-30 C 10,-22 2,-20 0,0 z',
            fillColor: color,
            fillOpacity: 1,
            strokeColor: '#FFF',
            strokeWeight: 2,
            scale: 1
        };
    }

    var mapOptions = {
        center: new google.maps.LatLng(0, 0),
        zoom: 1,
        minZoom: 1
    };

    me.map = new google.maps.Map(document.getElementById('mapDetail'), mapOptions);

    var allowedBounds = new google.maps.LatLngBounds(
        new google.maps.LatLng(85, -180),	// top left corner of map
        new google.maps.LatLng(-85, 180)	// bottom right corner
    );

    var k = 5.0;
    var n = allowedBounds.getNorthEast().lat() - k;
    var e = allowedBounds.getNorthEast().lng() - k;
    var s = allowedBounds.getSouthWest().lat() + k;
    var w = allowedBounds.getSouthWest().lng() + k;
    var neNew = new google.maps.LatLng(n, e);
    var swNew = new google.maps.LatLng(s, w);
    boundsNew = new google.maps.LatLngBounds(swNew, neNew);
    me.map.fitBounds(boundsNew);

    me.showLoading = function (text) {
        me.loadingText = text;
        me.showWaiting = true;

        $('.loadingText').animate({ 'opacity': '0', 'margin-top': '40' }, 100, function () {
            $('.loadingText').animate({ 'opacity': '1', 'margin-top': '5' }, 100);
        });
    }

    me.getAllParts = function () {
        me.showLoading('Loading, Please wait');

        me.listParts = [];
        me.listAssets = [];

        var rest = {
            method: 'GET',
            url: "/tracking/getAllParts",
            headers: { 'Content-Type': 'application/json' },
        }

        $http(rest).then(function (e) {
            var lst = e.data.list;
            me.listAssets = e.data.assets;

            for (var t = 0; t < lst.length; t++) {
                me.listParts.push({ id: lst[t].key, type: lst[t].value.type, name: lst[t].value.name, stock: lst[t].value.stock, photo: lst[t].value.photo, zipCode: lst[t].value.zipCode, urlFlag: lst[t].value.urlFlag, location: lst[t].value.location, expand: true, assets: lst[t].value.assets });
            }

            me.mountParts();

            me.showWaiting = false;
        }, function (err) {

            console.log(err);
        });
    }

    me.getAll = function () {


        me.getAllParts();

        me.listAssets = [];
    }

    me.showAlert = function (text) {
        me.responseText = text;

        $('.alert').css({ 'margin-top': '-300px' });
        $('.alert').animate({ 'margin-top': '3px' }, 100);

        setTimeout(function () {
            me.hideAlert();
        }, 2000)

    }

    me.hideAlert = function (text) {
        $('.alert').animate({ 'margin-top': '-300px' }, 100);
    }

    me.showError = function (text) {
        me.errorMessage = text;

        $('.error').animate({ 'margin-top': '3px' }, 100);

        me.timerErro = setTimeout(function () {
            me.hideError();
        }, 6000)

    }

    me.hideError = function (text) {
        clearTimeout(me.timerErro);

        $('.error').animate({ 'margin-top': '-300px' }, 100);
    }

    me.getDateHistory = function (index) {
        var hist = me.carSelected.details.history;

        switch (index) {
            case 0:
                if (hist.length > 0)
                    return (hist[hist.length - 1].date);
                else
                    return '';

                break;
            case 1:
                if (hist.length > 1)
                    return (hist[hist.length - 2].date);
                else
                    return '';

                break;
            case 2:
                if (hist.length > 2)
                    return (hist[hist.length - 3].date);
                else
                    return '';

                break;
            case 3:
                if (hist.length > 3)
                    return (hist[hist.length - 4].date);
                else
                    return '';

                break;
        }
    }

    me.getAssetHistory = function (index) {
        var hist = me.carSelected.details.history;

        switch (index) {
            case 0:
                if (hist.length > 0)
                    return (me.objParts[hist[hist.length - 1].id]);
                else
                    return '';

                break;
            case 1:
                if (hist.length > 1)
                    return (me.objParts[hist[hist.length - 2].id]);
                else
                    return '';

                break;
            case 2:
                if (hist.length > 2)
                    return (me.objParts[hist[hist.length - 3].id]);
                else
                    return '';

                break;
            case 3:
                if (hist.length > 3)
                    return (me.objParts[hist[hist.length - 4].id]);
                else
                    return '';

                break;
        }
    }

    $scope.$on('dragstart', function (event, itm) {
        itm = JSON.parse(itm.id);

        if (itm.id != me.carSelected.id) {
            me.hideDetails();
        }

        var orig = itm.details.history[0];
        var type = me.objParts[orig.id].type;

        $('.placeFactory').animate({ opacity: 0.3 });

        $(".placeFactory").each(function (index) {
            $(".placeFactory")[index].setAttribute("draggable", "false");
        });

        if (type == 'factory') {
            $('.placeStore').animate({ opacity: 0.3 });
            $('.placeClient').animate({ opacity: 0.3 });

            $(".placeStore").each(function (index) {
                $(".placeStore")[index].setAttribute("draggable", "false");
            });

            $('.boxDealership').addClass('boxDrop');
            $('.cmpListCarsDealership').css({ 'display': 'none' });
        }

        if (type == 'dealership') {
            $('.placeDealership').animate({ opacity: 0.3 });
            $('.placeClient').animate({ opacity: 0.3 });

            $('.boxStores').addClass('boxDrop');
            $('.cmpListCarsStores').css({ 'display': 'none' });

        }

        if (type == 'store') {
            $('.placeStore').animate({ opacity: 0.3 });
            $('.placeDealership').animate({ opacity: 0.3 });
            $('.cmpListCarsClients').css({ 'display': 'none' });
            $('.boxClients').addClass('boxDrop');
        }
    });

    me.resetOpacity = function () {
        $('.placeFactory').animate({ opacity: 1 });
        $('.placeStore').animate({ opacity: 1 });
        $('.placeClient').animate({ opacity: 1 });
        $('.placeDealership').animate({ opacity: 1 });

        $('.boxDrop').removeClass('boxDrop');

        $('.cmpListCarsDealership').css({ 'display': 'block' });
        $('.cmpListCarsStores').css({ 'display': 'block' });
        $('.cmpListCarsClients').css({ 'display': 'block' });
    }

    $scope.$on('dragend', function (event, itm) {
        itm = JSON.parse(itm.id);

        me.resetOpacity();
    });

    $scope.$on('droped', function (event) {
        me.resetOpacity();
    });

    me.mountParts = function () {
        me.objParts = [];

        for (var w = 0; w < me.listParts.length; w++) {
            var part = me.listParts[w];

            me.objParts[part.stock] = part;
        }

        for (var t = 0; t < me.listAssets.length; t++) {
            var itm = me.listAssets[t];

            for (var w = 0; w < me.listParts.length; w++) {
                var part = me.listParts[w];

                if (itm.details.hasOwnProperty('history')) {
                    if (itm.details.history.length > 0) {
                        if (itm.details.history[0].id == part.stock) {
                            part.assets.push(itm);
                            break;
                        }
                    }
                }
            }
        }
    }


    me.handleDrop = function (item, bin) {


        item = JSON.parse(item).details ;
        bin = JSON.parse(bin);

        var walletFrom = '';
        var walletTo = '';
        var car = '';

        for (var t = 0; t < me.listAssets.length; t++) {
            if (me.listAssets[t].details.id == item.id) {

                var tp1 = me.objParts[item.history[0].id];

                if (tp1.type == 'factory' && (bin.type == 'client' || bin.type == 'store')) {
                    return;
                }

                if (tp1.type == 'dealership' && (bin.type == 'client' || bin.type == 'dealership')) {
                    return;
                }

                if (tp1.type == 'store' && (bin.type == 'dealership' || bin.type == 'store')) {
                    return;
                }

                me.listAssets[t].details.history.unshift({ id: bin.id, date: new Date() });

                walletFrom = tp1.stock;
                walletTo = bin.stock;
                car = me.listAssets[t].fullname;

                if (tp1.type == 'factory') {
                    me.contAnim = 0;
                    me.animaLine();
                }

                if (tp1.type == 'dealership') {
                    me.contAnim = 81;
                    me.animaLine();
                }

                if (tp1.type == 'store') {
                    me.contAnim = 168;
                    me.animaLine();
                }

                break;
            }
        }

        me.showLoading('Moving car, Please wait');

        me.hideDetails();

        var rest = {
            method: 'POST',
            url: "/tracking/moveCar",
            headers: { 'Content-Type': 'application/json' },
            data: {
                data: {
                    walletFrom: walletFrom,
                    walletTo: walletTo,
                    car: car
                }
            }
        }

        $http(rest).then(function (e) {
            if(e.data.hasOwnProperty('error')){
                me.showError(e.data.error);
                return;
            }

            me.showAlert('Car successfully moved.');
            me.getAllParts();

        }, function (err) {

            console.log(err);
        });
    }

    var reduceImage = function (img) {
        var canvas = document.createElement("canvas");
        var ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);

        var MAX_WIDTH = 160;
        var MAX_HEIGHT = 160;
        var width = img.width;
        var height = img.height;

        if (width > height) {
            if (width > MAX_WIDTH) {
                height *= MAX_WIDTH / width;
                width = MAX_WIDTH;
            }
        } else {
            if (height > MAX_HEIGHT) {
                width *= MAX_HEIGHT / height;
                height = MAX_HEIGHT;
            }
        }
        canvas.width = width;
        canvas.height = height;
        var ctx = canvas.getContext("2d");

        ctx.drawImage(img, 0, 0, width, height);

        return canvas.toDataURL("image/jpg");
    }

    var onImageCarChange = function () {
        var files = $('.cmpUploadCar')[0].files[0];
        var img = document.createElement("img");
        img.addEventListener("load", function () {
            base64data = reduceImage(img);
            me.photoCar = base64data;
            $scope.$apply();
        });

        var reader = new window.FileReader();
        reader.readAsDataURL(files);
        reader.onload = function (e) {
            img.src = reader.result;
        }
    }

    var onImagePartChange = function () {
        var files = $('.cmpUploadPart')[0].files[0];
        var img = document.createElement("img");
        img.addEventListener("load", function () {
            base64data = reduceImage(img);
            me.photoPart = base64data;
            $scope.$apply();
        });

        var reader = new window.FileReader();
        reader.readAsDataURL(files);
        reader.onload = function (e) {
            img.src = reader.result;
        }
    }

    me.expandAssetsFactory = function () {
        me.showAssetsFactory = !me.showAssetsFactory;
    }

    me.expandAssetsDealership = function () {
        me.showAssetsDealership = !me.showAssetsDealership;
    }

    me.expandAssetsStore = function () {
        me.showAssetsStore = !me.showAssetsStore;
    }

    me.expandAssetsClient = function () {
        me.showAssetsClient = !me.showAssetsClient;
    }


    me.addPhotoCar = function () {
        $('.cmpUploadCar')[0].addEventListener('change', onImageCarChange, false);
        $('.cmpUploadCar')[0].click();
    }

    me.addPhotoPart = function () {
        $('.cmpUploadPart')[0].addEventListener('change', onImagePartChange, false);
        $('.cmpUploadPart')[0].click();
    }


    me.resetAnimation = function () {
        $('.box_0').css({ 'opacity': 0, 'margin-right': 19 });
        $('.box_1').css({ 'opacity': 0, 'margin-right': 19 });
        $('.box_2').css({ 'opacity': 0, 'margin-right': 19 });
        $('.box_3').css({ 'opacity': 0, 'margin-right': 19 });

        $('.boxTime_0').css({ 'background-color': '#e8edef' });
        $('.boxTime_1').css({ 'background-color': '#e8edef' });
        $('.boxTime_2').css({ 'background-color': '#e8edef' });
        $('.boxTime_3').css({ 'background-color': '#e8edef' });

        for (i = 0; i < me.marks.length; i++) {
            me.marks[i].setMap(null);
        }
        me.marks = [];
    }

    me.animateItm = function (itm) {
        if ($('.box_' + itm).css('opacity') != 1)
            $('.box_' + itm).css({ opacity: 1, 'margin-right': 0 });
    }

    me.showDetails = function (item) {

        $('.cmpDetails').animate({ bottom: 324 }, function () {
        });

        setTimeout(function () {
            var getUrl = window.location;
            var baseUrl = getUrl.protocol + "//" + getUrl.host + "/" + getUrl.pathname.split('/')[1];
            me.qrcode.clear();
            me.qrcode.makeCode(baseUrl + '#/main/' + 123123);

            $('.box_0').css({ 'opacity': 0, 'margin-right': 19 });
            $('.box_1').css({ 'opacity': 0, 'margin-right': 19 });
            $('.box_2').css({ 'opacity': 0, 'margin-right': 19 });
            $('.box_3').css({ 'opacity': 0, 'margin-right': 19 });

            $('.boxTime_0').css({ 'background-color': '#e8edef' });
            $('.boxTime_1').css({ 'background-color': '#e8edef' });
            $('.boxTime_2').css({ 'background-color': '#e8edef' });
            $('.boxTime_3').css({ 'background-color': '#e8edef' });

            $scope.$apply();

            for (i = 0; i < me.marks.length; i++) {
                me.marks[i].setMap(null);
            }
            me.marks = [];

            for (i = 0; i < me.lines.length; i++) {
                me.lines[i].setMap(null);
            }
            me.lines = [];

            me.contAnim = 0;
            me.showDetailAssets = true;
            me.carSelected = item;

            $('.boxTime_0').css({ 'background-color': '#2d9fc3' });
            $('.cmpLineTime').css({ height: 0 });
            me.animateItm(0);

            var hist = me.carSelected.details.history;

            me.addMarker(hist.length - 1);

            if (me.carSelected.details.history.length > 1)
                me.animaLine();

            $scope.$apply();
        }, 100)
    }

    me.animaLine = function () {
        if (!me.showDetailAssets)
            return;


        setTempo = setInterval(function () {
            var hist = me.carSelected.details.history;
            if (me.contAnim <= 254) {
                $('.cmpLineTime').css({ height: me.contAnim });

                if (me.contAnim > 81) {
                    if ($('.box_' + 1).css('opacity') != 1) {
                        me.animateItm(1);

                        $('.boxTime_1').css({ 'background-color': '#2d9fc3' });
                        if (me.carSelected.details.history.length > 1) {
                            me.addLine(hist.length - 1, hist.length - 2);

                            me.addMarker(hist.length - 2);

                            if (me.carSelected.details.history.length == 2) {

                                clearInterval(setTempo);
                                return;
                            }
                        }
                    }
                }

                if (me.contAnim > 168) {
                    if ($('.box_' + 2).css('opacity') != 1) {
                        me.animateItm(2);

                        $('.boxTime_2').css({ 'background-color': '#2d9fc3' });

                        if (me.carSelected.details.history.length > 2) {
                            me.addLine(hist.length - 2, hist.length - 3);

                            me.addMarker(hist.length - 3);


                            if (me.carSelected.details.history.length == 3) {

                                clearInterval(setTempo);
                                return;
                            }
                        }
                    }
                }

                if (me.contAnim > 253) {
                    if ($('.box_' + 3).css('opacity') != 1) {
                        me.animateItm(3);

                        $('.boxTime_3').css({ 'background-color': '#2d9fc3' });

                        if (me.carSelected.details.history.length > 3) {
                            me.addLine(hist.length - 3, hist.length - 4);

                            me.addMarker(hist.length - 4);

                            if (me.carSelected.details.history.length == 4) {

                                clearInterval(setTempo);
                                return;
                            }
                        }
                    }
                }

                me.contAnim++;
            }
            else
                clearInterval(setTempo);
        }, 5);
    }

    me.addLine = function (ind1, ind2) {
        var hist = me.carSelected.details.history;

        var line = new google.maps.Polyline({
            path: [me.objParts[hist[ind1].id].location, me.objParts[hist[ind2].id].location],
            geodesic: true,
            map: me.map,
            strokeColor: '#2d9fc3',
            strokeOpacity: 1.0,
            strokeWeight: 2
        });

        me.lines.push(line);
    }

    me.addMarker = function (ind) {
        var hist = me.carSelected.details.history;

        var marker = new google.maps.Marker({
            position: me.objParts[hist[ind].id].location,
            icon: pinSymbol('#2d9fc3'),
            map: me.map,
            title: me.objParts[hist[ind].id].name
        });
        me.marks.push(marker);
    }

    me.hideDetails = function () {
        $('.cmpDetails').animate({ bottom: -500 }, function () {
            setTimeout(function () {
                for (i = 0; i < me.marks.length; i++) {
                    me.marks[i].setMap(null);
                }
                me.marks = [];

                for (i = 0; i < me.lines.length; i++) {
                    me.lines[i].setMap(null);
                }
                me.lines = [];

                me.showDetailAssets = false;
                me.carSelected = {};
                me.carSelected.details = {}
                me.carSelected.details.history = [];

                $scope.$apply();
            }, 100);
        });
    }

    me.findZipCode = function () {
        if (!me.zipCodePart)
            return;

        me.addressMaps = '';
        me.urlFlag = '';
        me.showWaitingMaps = true;

        $('.cmpWaitingMaps').css({ display: 'block' });

        var rest = {
            method: 'GET',
            url: "https://maps.googleapis.com/maps/api/geocode/json?address=" + me.zipCodePart + "&key=" + me.apiMapsKey,
            headers: { 'Content-Type': 'application/json' }
        }

        $http(rest).then(function (e) {
            var arrAdress = e.data.results;
            var objAdress = {};

            if (arrAdress.length > 0) {
                objAdress = arrAdress[0];
                me.addressMaps = objAdress.formatted_address;

                var pais = '';

                for (var t = 0; t < objAdress.address_components.length; t++) {
                    var itm = objAdress.address_components[t];
                    for (var w = 0; w < itm.types.length; w++) {
                        var itm2 = itm.types[w];
                        if (itm2 == 'country') {
                            pais = itm.short_name;
                        }
                    }
                }

                me.locationZip = objAdress.geometry.location;
                me.urlFlag = "http://www.countryflags.io/" + pais + "/flat/64.png";
            }
            else {
                me.locationZip = "";
                me.urlFlag = "";
            }

            me.showWaitingMaps = false;

            $('.cmpWaitingMaps').css({ display: 'none' });

        }, function (err) {

            console.log(err);
        });
    }

    me.showAssets = function (itm) {
        if (itm.assets.length > 0)
            itm.expand = !itm.expand;
    }

    me.addFactory = function () {
        me.hideDetails();

        me.idPart = '';
        me.typePart = 'factory';
        me.namePart = '';
        me.zipCodePart = '';
        me.photoPart = 'assets/noPhoto.jpg';
        me.addressMaps = '';
        me.urlFlag = '';

        $(".cmpUploadPart").val('');

        me.textIncludePart = 'Add New Factory';
        me.icoIncludePart = 'fa fa-industry';

        me.showAddPart = true;
    }

    me.addClients = function () {
        me.hideDetails();

        me.idPart = '';
        me.typePart = 'client';
        me.namePart = '';
        me.zipCodePart = '';
        me.photoPart = 'assets/noPhoto.jpg';
        me.addressMaps = '';
        me.urlFlag = '';

        $(".cmpUploadPart").val('');

        me.textIncludePart = 'Add New Client';
        me.icoIncludePart = 'fa fa-male';

        me.showAddPart = true;
    }

    me.addStores = function () {
        me.hideDetails();

        me.idPart = '';
        me.typePart = 'store';
        me.namePart = '';
        me.zipCodePart = '';
        me.photoPart = 'assets/noPhoto.jpg';
        me.addressMaps = '';
        me.urlFlag = '';

        $(".cmpUploadPart").val('');

        me.textIncludePart = 'Add New Store';
        me.icoIncludePart = 'fa fa-car';

        me.showAddPart = true;
    }

    me.addDealership = function () {
        me.hideDetails();

        me.idPart = '';
        me.typePart = 'dealership';
        me.namePart = '';
        me.zipCodePart = '';
        me.photoPart = 'assets/noPhoto.jpg';
        me.addressMaps = '';
        me.urlFlag = '';

        $(".cmpUploadPart").val('');

        me.textIncludePart = 'Add New Dealership';
        me.icoIncludePart = 'fa fa-building';

        me.showAddPart = true;
    }

    me.editCar = function () {
        me.hideDetails();

        me.nameCar = '';
        me.yearCar = 2018;
        me.doorsCar = 4;

        me.photoCar = 'assets/noPhoto.jpg';
        $(".cmpUploadCar").val('');

        me.idFactory = id;
        me.showAddCar = true;
    }

    me.addCar = function (id) {
        me.hideDetails();

        me.nameCar = '';
        me.codeCar = '';
        me.yearCar = 2018;
        me.doorsCar = 4;

        me.photoCar = 'assets/noPhoto.jpg';
        $(".cmpUploadCar").val('');

        me.idFactory = id;
        me.showAddCar = true;
    }

    me.verifyFields = function () {
        if (me.verifyingCar)
            return true;
        else
            return false;
    }

    me.verifyFieldsParts = function () {
        if (me.showWaitingMaps)
            return true;
        else
            return false;
    }

    me.cancelCar = function (id) {
        me.showAddCar = false;
    }

    me.cancelPart = function (id) {
        me.showAddPart = false;

    }

    me.verifyCar = function () {
        me.verifyingCar = true;

        var rest = {
            method: 'GET',
            url: "/tracking/verifyCar/" + me.codeCar,
            headers: { 'Content-Type': 'application/json' }
        }

        $http(rest).then(function (e) {

            if (e.data == 'false')
                me.codeUsed = false;
            else
                me.codeUsed = true;

            me.verifyingCar = false;
        }, function (err) {

            console.log(err);
        });
    }

    me.saveCar = function () {
        var current_date = (new Date()).valueOf().toString();
        var random = Math.random().toString();
        me.idCar = CryptoJS.MD5(current_date + random).toString();

        $('.showAddPart').css({ height: 150 });

        me.showAddCar = false;

        me.hideError();

        me.showLoading('Saving car, Please wait');

        var rest = {
            method: 'POST',
            url: "/tracking/saveCar",
            headers: { 'Content-Type': 'application/json' },
            data: {
                data: {
                    id: me.idCar,
                    idFactory: me.idFactory.id,
                    idWalletFactory: me.objParts[me.idFactory.stock].stock,
                    code: me.codeCar,
                    name: me.nameCar,
                    photo: me.photoCar,
                    year: me.yearCar,
                    doors: me.doorsCar,
                    price: me.priceCar
                }
            }
        }

        $http(rest).then(function (e) {
            me.showWaiting = false;

            if(e.data.hasOwnProperty('error')){
                me.showAddCar = true;

                if(e.data.error == 'The asset already exist.')
                    e.data.error = 'Code already exist.'

                me.showError(e.data.error);
                return;
            }
            
            me.cancelPart();
            me.showAlert('Car successfully added.');
            me.getAllParts();

        }, function (err) {

            console.log(err);
        });
    }

    me.removePart = function (ind) {
        me.showLoading('Removing ' + ind.type + ', Please wait');

        me.hideDetails();

        var rest = {
            method: 'DELETE',
            url: "/tracking/deletePart",
            headers: { 'Content-Type': 'application/json' },
            data: {
                id: ind.id,
                data: ind
            }
        }

        $http(rest).then(function (e) {
            me.getAllParts();
            // me.clientRemove = null;
            // me.showAlert('Client successiful removed');
        }, function (err) {

            console.log(err);
        });
    }

    me.editPart = function (ind) {
        me.hideDetails();

        switch (ind.type) {
            case 'dealership':
                me.textIncludePart = 'Edit Dealership';
                me.icoIncludePart = 'fa fa-building';
                break;
            case 'store':
                me.textIncludePart = 'Edit Store';
                me.icoIncludePart = 'fa fa-car';
                break;
            case 'client':
                me.textIncludePart = 'Edit Client';
                me.icoIncludePart = 'fa fa-male';
                break;
            case 'factory':
                me.textIncludePart = 'Edit Factory';
                me.icoIncludePart = 'fa fa-industry';
                break;
        }

        me.idPart = ind.id;
        me.typePart = ind.type;
        me.namePart = ind.name;
        me.zipCodePart = ind.zipCode;
        me.photoPart = ind.photo;

        me.findZipCode();

        $(".cmpUploadPart").val('');

        me.showAddPart = true;
    }

    me.savePart = function () {
        $('.showAddPart').css({ height: 150 });

        me.showWaitingEdit = true;
        me.textWaitingEdit = 'Saving ' + me.typePart + ', Please wait';

        $('.loadingText').animate({ 'opacity': '0', 'margin-top': '40' }, 100, function () {
            $('.loadingText').animate({ 'opacity': '1', 'margin-top': '5' }, 100);
        });

        if (me.idPart == '') {
            var current_date = (new Date()).valueOf().toString();
            var random = Math.random().toString();
            me.idPart = CryptoJS.MD5(current_date + random).toString();
        }

        var rest = {
            method: 'POST',
            url: "/tracking/savePart",
            headers: { 'Content-Type': 'application/json' },
            data: {
                id: me.idPart,
                data: {
                    type: me.typePart,
                    name: me.namePart,
                    photo: me.photoPart,
                    zipCode: me.zipCodePart,
                    urlFlag: me.urlFlag,
                    location: me.locationZip
                }
            }
        }

        $http(rest).then(function (e) {
            if(e.data.hasOwnProperty('error')){
                me.showError(e.data.error);
                return;
            }

            me.showWaitingEdit = false;
            me.cancelPart();

            me.showAlert(me.typePart + ' sucessifuly added.');
            me.getAllParts();

        }, function (err) {

            console.log(err);
        });
    }

    me.getToken = function () {
        var rest = {
            method: 'GET',
            url: "/tracking/getToken/",
            headers: { 'Content-Type': 'application/json' },
        }

        $http(rest).then(function (e) {
            if(e.data.hasOwnProperty('error')){
                me.showError(e.data.error);
                return;
            }
            
            me.resetAnimation();
            me.resetOpacity();
            me.getAll();

        }, function (err) {
            console.log(err);
        });
    }

    me.getToken();
}

