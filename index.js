var express = require('express'),

    ApplicationController = require('./controllers/application_controller');

var app = express();

// Use jade
app.set('view engine', 'jade');
app.set('views', __dirname + '/views');
app.locals.basedir = __dirname + '/views';

app.use(express.logger('dev'));

// Host static files
app.use('/static', express.static(__dirname + '/static'));

// Routes
app.get('/', ApplicationController.index);
app.get('/m', ApplicationController.messageJSON);
app.get('/Archives/Public/:list([A-Za-z0-9\\-]+)/:period([A-Za-z0-9]+)/:message(\\d+).html', ApplicationController.viewMessage);
app.get('/try', ApplicationController.try);

// Heroku will set PORT environment variable
app.listen(process.env.PORT || 5000);
