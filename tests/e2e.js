'use strict';
var requestDigest = require('../request-digest.es5')(process.env.USER, process.env.PASSWORD);
var expect = require('chai').expect;

describe('+ End to end tests : ', function () {
  it('- Test with GET HTTP Callback: ', function (done) {
    requestDigest.request({
      host: process.env.URL,
      path: process.env.HOST,
      port: 80,
      method: 'GET',
      headers: {
        'mail': process.env.MAIL,
        'password': process.env.PASSWORDHEADER
      }
    }, function (err, resp, body) {
      expect(body != null).to.equal(false);
      expect(err != null).to.equal(true);
      done();
    });
  });

  it('- Test with GET HTTP Promise: ', function (done) {
    requestDigest.requestAsync({
      host: process.env.URL,
      path: process.env.HOST,
      port: 80,
      method: 'GET',
      headers: {
        'mail': process.env.MAIL,
        'password': process.env.PASSWORDHEADER
      }
    })
    .then(function (resp) {
      expect(resp == null).to.equal(true);
    })
    .catch(function (err) {
      expect(err != null).to.equal(true);
    })
    .finally(function () {
      done();
    });
  });
});
