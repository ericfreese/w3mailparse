var EmailAddress = require('../../models/email_address');

describe('EmailAddress', function() {
  describe('#parseInfo', function() {
    it('parses display name and address from recipient list item', function() {
      describe('with no quotes', function() {
        var e = new EmailAddress('Tab Atkins Jr. <jackalmage@gmail.com>');

        expect(e.displayName).toBe('Tab Atkins Jr.');
        expect(e.address).toBe('jackalmage@gmail.com');
      });

      describe('with quotes', function() {
        var e = new EmailAddress('"Tab Atkins Jr." <jackalmage@gmail.com>');

        expect(e.displayName).toBe('Tab Atkins Jr.');
        expect(e.address).toBe('jackalmage@gmail.com');
      });
    });

    it('handles email addresses not in angle brackets', function() {
      var e = new EmailAddress('jackalmage@gmail.com');

      expect(e.displayName).toBe(undefined);
      expect(e.address).toBe('jackalmage@gmail.com');
    });
  });
});
