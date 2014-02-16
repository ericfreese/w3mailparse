var crypto = require('crypto');

var EmailAddress = function(emailAddress) {
  this.parseInfo(emailAddress);
  this.gravatarUrl = 'http://www.gravatar.com/avatar/' + crypto.createHash('md5').update(this.address.toLowerCase()).digest('hex');
};

EmailAddress.emailAddressesFromString = function(emailAddressString) {
  return emailAddressString.split(',').map(function(a) {
    return new EmailAddress(a.replace(/^\s*[A-Za-z]+:/, '').trim());
  });
}

EmailAddress.prototype.parseInfo = function(emailAddress) {
  var angleAddressMatch = emailAddress.match(/\<([^\>]+)\>/);

  if (!!angleAddressMatch) {
    this.displayName = emailAddress.replace(/(\<[^\>]+\>|\")/g, '').trim();
    this.address = angleAddressMatch[1];
  } else {
    this.displayName = undefined;
    this.address = emailAddress.trim();
  }
};

module.exports = EmailAddress;
