var async = require('async'),

    EmailMessage = require('./email_message');

var EmailThread = function() {
  this.emailMessages = [];
};

EmailThread.buildMessageThread = function(startAtUrl, maxMessages, callback) {
  var emailThread = new EmailThread(),
      next = startAtUrl,
      numMessagesRetrieved = 0;

  async.whilst(
    function() { return numMessagesRetrieved < maxMessages && !!next},
    function(callback) {
      EmailMessage.buildFromUrl(next, function(emailMessage) {
        emailThread.pushMessage(emailMessage);

        next = !!emailMessage.nextInThread ? emailMessage.nextInThread.href : undefined;
        numMessagesRetrieved++;

        callback();
      });
    },
    function(err) { callback(emailThread); }
  );
};

EmailThread.prototype.pushMessage = function(emailMessage) {
  this.emailMessages.push(emailMessage);
};

EmailThread.prototype.unshiftMessage = function(emailMessage) {
  this.emailMessages.unshift(emailMessage);
};



module.exports = EmailThread;
