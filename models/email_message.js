var http = require('http'),
    url = require('url'),
    cheerio = require('cheerio'),
    async = require('async'),

    EmailAddress = require('./email_address');

var messageCache = {};

var EmailMessage = function(attrs) {
  this.id = attrs.id;
  this.w3url = attrs.w3url;
  this.subject = attrs.subject;
  this.to = attrs.to;
  this.from = attrs.from;
  this.cc = attrs.cc;
  this.date = attrs.date;
  this.content = attrs.content;
};

EmailMessage.buildMessageTree = function(w3url, depth, callback) {
  if (!!messageCache[w3url]) {
    console.log('Cache hit for: ' + w3url);
    setImmediate(function() {
      callback(messageCache[w3url]);
    });
    return;
  }

  console.log('Cache miss, fetching email message from: ' + w3url);
  http.get(w3url, function(res) {
    var responseBody = '';

    res.on('data', function (chunk) {
      responseBody += chunk;
    });

    res.on('end', function() {
      var $ = cheerio.load(responseBody),
          $cc = $('#cc'),
          $inReplyTo = $('a:contains("In reply to")'),
          $replies = $('a[title="Message sent in reply to this message"]');

      var emailMessage = new EmailMessage({
        subject: $('.head > h1').text(),
        from: EmailAddress.emailAddressesFromString($('#from').text()),
        to: EmailAddress.emailAddressesFromString($('#to').text()),
        date: new Date(Date.parse($('#date').text().replace(/^[A-Za-z]+:/, ''))),
        content: $('#body').text(),
        w3url: w3url
      });

      emailMessage.id = w3url.match(/\/(\d+)\.html$/)[1];

      if ($('#cc').length > 0) {
        emailMessage.cc = EmailAddress.emailAddressesFromString($cc.text());
      }

      if ($inReplyTo.length > 0) {
        emailMessage.inReplyTo = {
          title: $inReplyTo.attr('title'),
          href: url.resolve(w3url, $inReplyTo.attr('href'))
        };
      }

      messageCache[w3url] = emailMessage;

      if (depth > 1 && $replies.length > 0) {
        emailMessage.replies = [];

        async.each($replies, function(reply, callback) {
          EmailMessage.buildMessageTree(url.resolve(w3url, $(reply).attr('href')), depth - 1, function(replyMessage) {
            emailMessage.replies.push(replyMessage);
            callback();
          });
        }, function(err) {
          callback(emailMessage);
        });
      } else {
        callback(emailMessage);
      }
    });
  });
};

module.exports = EmailMessage;
