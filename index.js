var express = require('express'),
    // params = require('express-params'),

    EmailThread = require('./models/email_thread');

var app = express();

// params.extend(app);

app.set('view engine', 'jade');
app.set('views', __dirname + '/views');
app.locals.basedir = __dirname + '/views';

app.use(express.logger('dev'));
app.use(express.bodyParser());

app.use('/static', express.static(__dirname + '/static'));

app.get('/:id([A-Za-z]+)', function (req, res){
  res.send(req.params.id);
});

app.get('/:list([A-Za-z0-9\\-]+)/:period([A-Za-z0-9]+)/:message(\\d+).html', function(req, res) {
  var url = 'http://lists.w3.org/Archives/Public/' + [ req.params.list, req.params.period, req.params.message ].join('/') + '.html',
      num = req.query.n || 10;

  EmailThread.buildMessageThread(url, num, function(emailThread) {
    res.render('thread', { thread : emailThread });
  });
});


app.listen(process.env.PORT || 5000);


