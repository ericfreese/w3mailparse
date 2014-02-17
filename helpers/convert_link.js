var url = require('url');

module.exports = function(w3url, host) {
  var permalinkUrl = url.parse(w3url);
  permalinkUrl.host = host;
  return url.format(permalinkUrl);
};
