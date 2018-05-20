var development = {
	env : global.process.env.NODE_ENV || 'development',
	port : global.process.env.PORT || 8080,
	host : global.process.env.HOST || 'localhost',
	API_2LEDGER : global.process.env.API_2LEDGER || '2ledger-api-dev.azurewebsites.net',
	API_2LEDGER_SAMPLE_ID_NETWORK : '5ae262c2db26860036e5bd96',
	API_2LEDGER_TOKEN : global.process.env.API_2LEDGER_TOKEN || '.',
	API_2LEDGER_SAMPLE_CLIENT_ENTITY_ID : global.process.env.API_2LEDGER_SAMPLE_CLIENT_ENTITY_ID || '5af74d529e97c800397be3fd'
};

var production = {
	env : global.process.env.NODE_ENV || 'production',
	port : 8080,
	host : global.process.env.HOST || 'localhost',
	API_2LEDGER : global.process.env.API_2LEDGER,
	API_2LEDGER_SAMPLE_ID_NETWORK : '5ae262c2db26860036e5bd96',
	API_2LEDGER_TOKEN : global.process.env.API_2LEDGER_TOKEN,
	API_2LEDGER_SAMPLE_CLIENT_ENTITY_ID : global.process.env.API_2LEDGER_SAMPLE_CLIENT_ENTITY_ID
};

exports.Config = global.process.env.NODE_ENV === 'production' ? production : development;
