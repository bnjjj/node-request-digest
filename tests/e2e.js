'use strict';
var requestDigest = require('../request-digest')(process.env.USER, process.env.PASSWORD);

describe('+ End to end tests : ', function () {
  it('- Test with GET HTTP : ', function (done) {
    requestDigest.request({
      host: process.env.URL,
      path: process.env.HOST,
      port: 80,
      method: 'GET',
      headers: {
        'mail': process.env.USER + process.env.MAIL,
        'password': process.env.PASSWORD
      }
    }, done);
  });
});

