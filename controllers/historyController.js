'use strict';

var Promise = require('promise');
var https = require('https');
var querystring = require('querystring');
const crypto = require('crypto');

module.exports = function (app) {
	///////////////////////////////////////////////////////////////////////
	// ChamadaGET
	// Método para chamadas GET
	///////////////////////////////////////////////////////////////////////
	function chamadaGET(path) {
		return new Promise((resolve, reject) => {
			var auth = 'Bearer ' + global.cfg.API_2LEDGER_TOKEN;

			const options = {
				hostname: global.cfg.API_2LEDGER,
				method: 'GET',
				path: '/v1' + path,
				headers: {
					'Content-Type': 'application/json',
					'Authorization': auth
				}
			};

			const req = https.request(options, (response) => {
				response.setEncoding('utf8');
				var body = '';

				response.on('data', (retorno) => {
					body += retorno;
				});

				response.on('end', function () {
					resolve(body);
				});
			});
			req.on('error', (e) => {
				console.info(`problem with request: ${e.message}`);
			});
			req.end();
		});
	}

	///////////////////////////////////////////////////////////////////////
	// ChamadaDELETE
	// Método para chamadas DELETE
	///////////////////////////////////////////////////////////////////////
	function chamadaDELETE(path) {
		return new Promise((resolve, reject) => {
			var auth = 'Bearer ' + global.cfg.API_2LEDGER_TOKEN;

			const options = {
				hostname: global.cfg.API_2LEDGER,
				method: 'DELETE',
				path: '/v1' + path,
				headers: {
					'Content-Type': 'application/json',
					'Authorization': auth
				}
			};

			const req = https.request(options, (response) => {
				response.setEncoding('utf8');
				var body = '';

				response.on('data', (retorno) => {
					body += retorno;
				});

				response.on('end', function () {
					resolve(body);
				});
			});
			req.on('error', (e) => {
				console.info(`problem with request: ${e.message}`);
			});
			req.end();
		});
	}

	///////////////////////////////////////////////////////////////////////
	// ChamadaPOST
	// Método para chamadas POST
	///////////////////////////////////////////////////////////////////////
	function chamadaPOST(path, data) {
		return new Promise((resolve, reject) => {
			var auth = 'Bearer ' + global.cfg.API_2LEDGER_TOKEN;

			const options = {
				hostname: global.cfg.API_2LEDGER,
				method: 'POST',
				path: '/v1' + path,
				headers: {
					'Content-Type': 'application/json',
					'Authorization': auth
				}
			};

			const req = https.request(options, (response) => {
				var body = '';

				response.setEncoding('utf8');
				response.on('data', (retorno) => {
					body += retorno;
				});

				response.on('end', function () {
					resolve(body);
				});
			});
			req.on('error', (e) => {
				console.info(`problem with request: ${e.message}`);
			});
			req.write(JSON.stringify(data));
			req.end();
		});
	}

	var history = {

		///////////////////////////////////////////////////////////////////////
		// buscarConfiguracoes
		// Método para retornar as configurações do aplicativo
		///////////////////////////////////////////////////////////////////////
		getToken: function (req, res) {

			const options = {
				hostname: global.cfg.API_2LEDGER,
				method: 'POST',
				path: '/v1/login',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': 'Basic YWRtX1VzZXJNYW5hZ2VyQGdtYWlsLmNvbToxMjM0NTY='
				}
			};

			const req2 = https.request(options, (response) => {
				response.setEncoding('utf8');
				var body = '';

				response.on('data', (retorno) => {
					body += retorno;
				});

				response.on('end', function () {
					global.cfg.API_2LEDGER_TOKEN = JSON.parse(body).response;

					res.send({ 'sucess': 'true' });
				});
			});
			req2.on('error', (e) => {
				res.send({'error': e.message});
			});
			req2.write(JSON.stringify({ email: 'adm_UserManager@gmail.com', password: '123456' }));
			req2.end();
		},

		///////////////////////////////////////////////////////////////////////
		// getAll
		// Metod
		///////////////////////////////////////////////////////////////////////
		getAllParts: function (req, res) {
			var objItems = {};
			var result = [];
			var listCars = [];

			chamadaGET('/entities/' + global.cfg.API_2LEDGER_SAMPLE_CLIENT_ENTITY_ID + '/records').then(d => {
				if(JSON.parse(d).success == 'false'){
					res.send({'error': JSON.parse(d).message});
					return;
				}

				var list = JSON.parse(d).response;

				for (var k = 0; k < list.length; k++) {
					if (!objItems[list[k].key]) {
						objItems[list[k].key] = {};
						objItems[list[k].key].versions = [];
						list[k].value.assets = [];
						objItems[list[k].key].versions.push(list[k]);
					}
					else {
						list[k].value.assets = [];
						objItems[list[k].key].versions.push(list[k]);
					}
				}

				for (var key in objItems) {
					var versao = objItems[key].versions[objItems[key].versions.length - 1];
					if (versao.value.status != 'inactive')
						result.push(versao)
				}

				var lstCars = [];
				chamadaGET('/networks/' + global.cfg.API_2LEDGER_SAMPLE_ID_NETWORK + '/assets').then(d => {
					if(JSON.parse(d).success == 'false'){
						res.send({'error': JSON.parse(d).message});
						return;
					}

					var lst = JSON.parse(d).response;
					var objCars = {};

					for (var t = 0; t < lst.length; t++) {
						var car = lst[t];
						var det = JSON.parse(car.details);
						det.history = [];
						car.details = det;

						if (car.details.hasOwnProperty('idFactory') && car.details.hasOwnProperty('date')) {
							if (!objCars[car.fullname]) {
								objCars[car.fullname] = car;
							}
						}
					}

					var urls = [];
					for (var k = 0; k < result.length; k++) {
						if (result[k].value.hasOwnProperty('stock')) {
							urls.push(chamadaGET('/networks/' + global.cfg.API_2LEDGER_SAMPLE_ID_NETWORK + '/wallets/' + result[k].value.stock + '/transactions'));
						}
					}

					Promise.all(urls).then(function (results) {
						for (var r = 0; r < results.length; r++) {
							var itm = JSON.parse(results[r]).response;
							var objTo = {};

							for (var x = 0; x < itm.length; x++) {
								if(!objTo[itm[x].to]){
									objTo[itm[x].to] = true;

									if (objCars[itm[x].to])
									objCars[itm[x].to].details.history.push({ id: itm[x].myaddresses[0], date: new Date(itm[x].timereceived * 1000) })
								}
							}
						}

						for (var key in objCars) {
							if (objCars[key].details.history.length > 0) {
								objCars[key].details.history.sort(function (a, b) {
									if (a.date > b.date)
										return -1;
									if (a.date < b.date)
										return 1;
									return 0;
								});

								listCars.push(objCars[key])
							}
						}

						res.send({ list: result, assets: listCars });
					});
				});


			})
		},

		///////////////////////////////////////////////////////////////////////
		// savePart
		// Metod
		///////////////////////////////////////////////////////////////////////
		savePart: function (req, res) {
			var value = req.body.data;
			value.status = 'active';
			var obj = {};

			chamadaPOST('/networks/' + global.cfg.API_2LEDGER_SAMPLE_ID_NETWORK + '/wallets', obj).then(d => {
				if(JSON.parse(d).success == 'false'){
					res.send({'error': JSON.parse(d).message});
					return;
				}

				value.stock = JSON.parse(d).response[0].address;
				value.sample = 'CAR_TRACKING'
				var obj = { key: req.body.id, value: value };
				chamadaPOST('/entities/' + global.cfg.API_2LEDGER_SAMPLE_CLIENT_ENTITY_ID + '/records', obj).then(d => {
					if(JSON.parse(d).success == 'false'){
						res.send({'error': JSON.parse(d).message});
						return;
					}

					res.send(JSON.parse(d).response);
				})
			})
		},


		///////////////////////////////////////////////////////////////////////
		// movePart
		// Metod
		///////////////////////////////////////////////////////////////////////
		moveCar: function (req, res) {
			var walletFrom = req.body.data.walletFrom
			var walletTo = req.body.data.walletTo
			var car = req.body.data.car

			var obj = {
				"to": walletTo,
				"qty": 1,
				"comment": car,
				"asset": car
			}

			chamadaPOST('/networks/' + global.cfg.API_2LEDGER_SAMPLE_ID_NETWORK + '/wallets/' + walletFrom + '/transactions', obj).then(d => {
				if(JSON.parse(d).success == 'false'){
					res.send({'error': JSON.parse(d).message});
					return;
				}

				res.send(JSON.parse(d));
			})
		},


		///////////////////////////////////////////////////////////////////////
		// deletePart
		// Metod
		///////////////////////////////////////////////////////////////////////
		deletePart: function (req, res) {
			var value = req.body.data;
			value.status = 'inactive';

			var obj = { key: req.body.id, value: value };
			chamadaPOST('/entities/' + global.cfg.API_2LEDGER_SAMPLE_CLIENT_ENTITY_ID + '/records', obj).then(d => {
				if(JSON.parse(d).success == 'false'){
					res.send({'error': JSON.parse(d).message});
					return;
				}

				res.send(JSON.parse(d).response);
			})
		},

		///////////////////////////////////////////////////////////////////////
		// verifyCar
		// Metod
		///////////////////////////////////////////////////////////////////////
		verifyCar: function (req, res) {
			var value = req.params.siglaCar;
			chamadaGET('/networks/' + global.cfg.API_2LEDGER_SAMPLE_ID_NETWORK + '/assets/' + value + '}').then(d => {
				res.send(JSON.parse(d).success);
			})
		},

		///////////////////////////////////////////////////////////////////////
		// saveCar
		// Metod
		///////////////////////////////////////////////////////////////////////
		saveCar: function (req, res) {
			var value = req.body.data;
			var idFactory = value.idFactory;

			value.date = new Date();

			var obj = {
				"name": value.code,
				"qty": 1,
				"precision": 1,
				"details": JSON.stringify(value)
			}

			chamadaPOST('/networks/' + global.cfg.API_2LEDGER_SAMPLE_ID_NETWORK + '/assets', obj).then(d => {
				if(JSON.parse(d).success == 'false'){
					res.send({'error': JSON.parse(d).message});
					return;
				}

				var idWallet = JSON.parse(d).response.address;

				var obj = {
					"to": value.idWalletFactory,
					"qty": 1,
					"comment": JSON.parse(d).response.fullname,
					"asset": JSON.parse(d).response.fullname
				}

				chamadaPOST('/networks/' + global.cfg.API_2LEDGER_SAMPLE_ID_NETWORK + '/wallets/' + idWallet + '/transactions', obj).then(d => {
					if(JSON.parse(d).success == 'false'){
						res.send({'error': JSON.parse(d).message});
						return;
					}

					res.send(d);
				})
			});
		},

	}

	return history;
}

