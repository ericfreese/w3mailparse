$(function() {
  var messageTemplate = _.template($('#message-template').text()),
      replyErrorTemplate = _.template($('#reply-error-template').text()),

      loadMessage = function(url, messageContext) {
        var deferred = new $.Deferred();

        $.get('/m', { url: url }, function(data) {
          deferred.resolve({
            date: new Date(data.date),
            html: messageTemplate({
              message: data,
              context: messageContext
            })
          });
        }).error(function() {
          deferred.resolve({
            error: 'Error loading reply.',
            html: replyErrorTemplate({ url: url })
          });
        });

        return deferred;
      };
  
  $('#messages').append(messageTemplate({
    message: JSON.parse($('#message-data').text()),
    context: { open: true }
  }));

  $(document).on('click', '[data-load-replies]', function(e) {
    var $button = $(e.target),
        $replies = $button.closest('.email-message-replies').find('a.email-message_reply-link'),
        deferreds = [];

    $button.button('loading');

    $replies.each(function() {
      deferreds.push(loadMessage($(this).attr('href'), {
        even: $button.parentsUntil('body', '.email-message').length % 2 === 1
      }));
    });

    $.when.apply($, deferreds).done(function() {
      var replies = Array.prototype.slice.call(arguments),
          $repliesDiv = $('<div/>');

      replies.sort(function(a, b) {
        if (!!a.error) return 1; // Put errors at the bottom
        return a.date.getTime() - b.date.getTime();
      });

      _.each(replies, function(i) {
        $repliesDiv.append(i.html);
      })

      $button.replaceWith($repliesDiv);
    });

    e.preventDefault();
  });
});