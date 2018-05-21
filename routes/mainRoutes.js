module.exports = function(app) {
	var tracking = app.controllers.trackingController;

	app.get('/tracking/getToken', tracking.getToken);
	app.get('/tracking/getAllParts', tracking.getAllParts);
	app.get('/tracking/verifyCar/:siglaCar', tracking.verifyCar);	
	app.post('/tracking/savePart' , tracking.savePart);
	app.post('/tracking/moveCar' , tracking.moveCar);
	app.post('/tracking/saveCar' , tracking.saveCar);
	app.delete('/tracking/deletePart', tracking.deletePart);
};
