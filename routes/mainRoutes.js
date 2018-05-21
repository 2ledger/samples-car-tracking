module.exports = function(app) {
	var tracking = app.controllers.trackingController;

	app.get('/getToken', tracking.getToken);
	app.get('/getAllParts', tracking.getAllParts);
	app.get('/verifyCar/:siglaCar', tracking.verifyCar);	
	app.post('/savePart' , tracking.savePart);
	app.post('/moveCar' , tracking.moveCar);
	app.post('/saveCar' , tracking.saveCar);
	app.delete('/deletePart', tracking.deletePart);
};
