//var app = require('electron').app
//var app = require('app');
//const {app} = require('electron').remote;
//var userDataPath = app.getPath('userData');

//var BrowserWindow = require('electron').BrowserWindow

const electron = require('electron');
const {app} = electron;
const {BrowserWindow} = electron ;
let win ;
app.on('window-all-closed', function() {

	if (process.platform != 'darwin') {
		app.quit();
	}

});


app.on('ready', createWindow);

//app.on('activate', () => { if (win === null) { createWindow();  } ;

function createWindow() {
 // Create the browser window.
 win = new BrowserWindow({width: 480, height: 800 });

 win.loadURL(`file://${__dirname}/public/index.html`);
// win.loadURL('http://10.238.34.26:300');
 // Open the DevTools.
// win.openDevTools()
 //verificar itens
// // win.$ = win.jQuery = require('./public/angular/jquery-1.11.3.js');
 // console.log( [$, jQuery ]);


 // Emitted when the window is closed.
 win.on('closed', () => {
 	 win = null;
 });
}
