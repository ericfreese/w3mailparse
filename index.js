var express = require('express'),
    moment = require('moment'),

    EmailMessage = require('./models/email_message');

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
      depth = req.query.depth || 10;

  EmailMessage.buildMessageTree(url, depth, function(rootMessage) {
    res.render('thread', { rootMessage: rootMessage, moment: moment });
  });
});

// app.get('/:list([A-Za-z0-9\\-]+)/:period([A-Za-z0-9]+)/:message(\\d+).:type((html|json))', function(req, res) {
//   var url = 'http://lists.w3.org/Archives/Public/' + [ req.params.list, req.params.period, req.params.message ].join('/') + '.html';

//   EmailMessage.buildMessage(url, depth, function(message) {
//     switch (type) {
//       case 'html':
//         res.render('thread', { message: message, moment: moment });
//         break;
//       case 'json':
//         res.send(JSON.stringify(message));
//     }
//   });

// });

app.listen(process.env.PORT || 5000);


