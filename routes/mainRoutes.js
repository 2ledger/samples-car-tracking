module.exports = function(app) {
	var carTracking = app.controllers.carTrackingController;

	app.get('/carTracking/getToken', carTracking.getToken);
	app.get('/carTracking/getAllParts', carTracking.getAllParts);
	app.get('/carTracking/verifyCar/:siglaCar', carTracking.verifyCar);	
	app.post('/carTracking/savePart' , carTracking.savePart);
	app.post('/carTracking/moveCar' , carTracking.moveCar);
	app.post('/carTracking/saveCar' , carTracking.saveCar);
	app.delete('/carTracking/deletePart', carTracking.deletePart);
};
