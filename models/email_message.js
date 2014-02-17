var http = require('http'),
    url = require('url'),
    cheerio = require('cheerio'),
    crypto = require('crypto'),
    _ = require('lodash'),

    EmailAddress = require('./email_address'),

    convertLink = require('../helpers/convert_link'),

    messageCache = {},
    recentlyViewed = [];

var EmailMessage = function(attrs) {
  this.id = attrs.id;
  this.subject = attrs.subject;
  this.to = attrs.to;
  this.from = attrs.from;
  this.cc = attrs.cc;
  this.date = attrs.date;
  this.content = attrs.content;
  this.w3url = attrs.w3url;
  this.permalink = attrs.permalink;
};

EmailMessage.logView = function(permalink, subject) {
  if (_.find(recentlyViewed, function(i) { return i.permalink === permalink; }) === undefined) {
    recentlyViewed.push({
      permalink: permalink,
      subject: subject
    });

    if (recentlyViewed.length > 50) recentlyViewed.shift();
  }
};

EmailMessage.recentlyViewed = function(num) {
  return _.shuffle(recentlyViewed).slice(0, num || 10);
};

EmailMessage.buildMessage = function(w3url, host, callback, errCallback) {
  if (messageCache[w3url]) {
    console.log('Cache hit for: ' + w3url);
    callback(messageCache[w3url]);
    return;
  }

  console.log('Cache miss, fetching email message from: ' + w3url);
  http.get(w3url, function(res) {
    var responseBody = '';

    if (res.statusCode !== 200) {
      console.error('Response with status code other than 200');
      errCallback();
      return;
    }

    res.on('data', function (chunk) {
      responseBody += chunk;
    });

    res.on('end', function() {
      try {
        var $ = cheerio.load(responseBody),
            $cc = $('#cc'),
            $inReplyTo = $('a:contains("In reply to")'),
            $replies = $('a[title="Message sent in reply to this message"]');

        var emailMessage = new EmailMessage({
          id: crypto.createHash('md5').update(w3url).digest('hex'),
          subject: $('.head > h1').text(),
          from: EmailAddress.emailAddressesFromString($('#from').text())[0],
          to: EmailAddress.emailAddressesFromString($('#to').text()),
          date: new Date(Date.parse($('#date').text().replace(/^[A-Za-z]+:/, ''))),
          content: $('#body').text(),
          w3url: w3url,
          permalink: convertLink(w3url, host)
        });


        if ($('#cc').length > 0) {
          emailMessage.cc = EmailAddress.emailAddressesFromString($cc.text());
        }

        if ($inReplyTo.length > 0) {
          emailMessage.inReplyTo = url.resolve(w3url, $inReplyTo.attr('href'));
        }

        if ($replies.length > 0) {
          emailMessage.replies = [];

          $replies.each(function() {
            emailMessage.replies.push(url.resolve(w3url, $(this).attr('href')));
          });
        }

        messageCache[w3url] = emailMessage;

        callback(emailMessage);
      } catch (e) {
        console.error(e);
        errCallback();
      }
    });
  }).on('error', function(e) {
    console.error(e);
    errCallback();
  });
};

module.exports = EmailMessage;
