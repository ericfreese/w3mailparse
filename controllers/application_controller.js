var url = require('url'),

    EmailMessage = require('../models/email_message');

module.exports = {
  index: function(req, res) {
    res.render('index', {
      host: req.headers.host,
      recentlyViewed: EmailMessage.recentlyViewed(15)
    });
  },

  messageJSON: function(req, res) {
    var w3url = req.query.url;

    // Make sure url is on w3.org domain
    if (url.parse(w3url).hostname.match(/(^|\.)w3\.org$/) === null) {
      res.status(418).send("I'm a teapot");
      return;
    }

    EmailMessage.buildMessage(w3url, req.headers.host, function(message) {
      res.json(message);
    }, function() {
      res.status(500).send('Internal Server Error');
    });
  },

  viewMessage: function(req, res) {
    var w3url = 'http://lists.w3.org/Archives/Public/' + [ req.params.list, req.params.period, req.params.message ].join('/') + '.html';

    EmailMessage.buildMessage(w3url, req.headers.host, function(message) {
      res.render('thread', {
        title: message.subject,
        message: message
      });
      EmailMessage.logView(message.permalink, message.subject);
    }, function() {
      res.status(500).send('Internal Server Error');
    });

  },

  try: function(req, res) {
    var recent = EmailMessage.recentlyViewed(1);

    res.redirect(recent.length > 0 ? recent[0].permalink : url.format({
      host: req.headers.host,
      pathname: '/Archives/Public/www-style/2014Feb/0032.html'
    }));
  }
};
