module.exports = function(app) {
	var history = app.controllers.historyController;

	app.get('/history/getToken', history.getToken);
	app.get('/history/getAllParts', history.getAllParts);
	app.get('/history/verifyCar/:siglaCar', history.verifyCar);	
	app.post('/history/savePart' , history.savePart);
	app.post('/history/moveCar' , history.moveCar);
	app.post('/history/saveCar' , history.saveCar);
	app.delete('/history/deletePart', history.deletePart);
};
