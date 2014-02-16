var http = require('http'),
    url = require('url'),
    cheerio = require('cheerio'),

    EmailAddress = require('./email_address');

var messageCache = {};

var EmailMessage = function(attrs) {
  this.w3url = attrs.w3url;
  this.subject = attrs.subject;
  this.to = attrs.to;
  this.from = attrs.from;
  this.cc = attrs.cc;
  this.date = attrs.date;
  this.content = attrs.content;
};

EmailMessage.buildFromUrl = function(w3url, callback) {

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
          $subject = $('.head > h1'),
          $from = $('#from'),
          $to = $('#to'),
          $cc = $('#cc'),
          $date = $('#date'),
          $messageId = $('#message-id'),
          $body = $('#body'),
          $inReplyTo = $('a:contains("In reply to")'),
          $nextInThread = $('a:contains("Next in thread")');

      // Unwrap anchor tags in email address lists
      $from.find('a').each(function() { $(this).replaceWith($(this).text()); });
      $to.find('a').each(function() { $(this).replaceWith($(this).text()); });
      $cc.find('a').each(function() { $(this).replaceWith($(this).text()); });

      // Remove extra anchor tag in body
      $body.find('a:first-child').remove();

      var emailMessage = new EmailMessage({
        subject: $subject.text(),
        from: EmailAddress.emailAddressesFromString($from.text()),
        to: EmailAddress.emailAddressesFromString($to.text()),
        date: $date.text().replace(/^[A-Za-z]+:/, ''),
        content: $body.text(),
        w3url: w3url
      });

      if ($cc.length > 0) {
        emailMessage.cc = EmailAddress.emailAddressesFromString($cc.text());
      }

      if ($inReplyTo.length > 0) {
        emailMessage.inReplyTo = {
          title: $inReplyTo.attr('title'),
          href: url.resolve(w3url, $inReplyTo.attr('href'))
        };
      }

      if ($nextInThread.length > 0) {
        emailMessage.nextInThread = {
          title: $nextInThread.attr('title'),
          href: url.resolve(w3url, $nextInThread.attr('href'))
        };
      }

      messageCache[w3url] = emailMessage;

      console.log('Finished.');
      callback(emailMessage);
    });
  });
};

module.exports = EmailMessage;
