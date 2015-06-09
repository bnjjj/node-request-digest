'use strict';
//
// # Digest Client
//
// Use together with HTTP Client to perform requests to servers protected
// by digest authentication.
//

var HTTPDigest = function () {
  var crypto = require('crypto');
  var request = require('request');
  var _ = require('lodash');

  var HTTPDigest = function (username, password) {
    this.nc = 0;
    this.username = username;
    this.password = password;
  };

  //
  // ## Make request
  //
  // Wraps the http.request function to apply digest authorization.
  //
  HTTPDigest.prototype.request = function (options, callback) {
    var self = this;
    options.url = options.host + options.path;
    return request(options, function (error, res) {
      self._handleResponse(options, res, callback);
    });
  };

  //
  // ## Handle authentication
  //
  // Parse authentication headers and set response.
  //
  HTTPDigest.prototype._handleResponse = function handleResponse(options, res, callback) {
    var challenge = this._parseChallenge(res.caseless.dict['www-authenticate']);
    var ha1 = crypto.createHash('md5');
    ha1.update([this.username, challenge.realm, this.password].join(':'));
    var ha2 = crypto.createHash('md5');
    ha2.update([options.method, options.path].join(':'));

    var cnonceObj = this._generateCNONCE(challenge.qop);

    // Generate response hash
    var response = crypto.createHash('md5');
    var responseParams = [
      ha1.digest('hex'),
      challenge.nonce
    ];

    if (cnonceObj.cnonce) {
      responseParams.push(cnonceObj.nc);
      responseParams.push(cnonceObj.cnonce);
    }

    responseParams.push(challenge.qop);
    responseParams.push(ha2.digest('hex'));
    response.update(responseParams.join(':'));

    // Setup response parameters
    var authParams = {
      username: this.username,
      realm: challenge.realm,
      nonce: challenge.nonce,
      uri: options.path,
      qop: challenge.qop,
      opaque: challenge.opaque,
      response: response.digest('hex'),
    };

    authParams = _.omit(authParams, function(elt) {
      return elt == null;
    });

    if (cnonceObj.cnonce) {
      authParams.nc = cnonceObj.nc;
      authParams.cnonce = cnonceObj.cnonce;
    }

    var headers = options.headers || {};
    headers.Authorization = this._compileParams(authParams);
    options.headers = headers;

    return request(options, function (error, response, body) {
      callback(error, response, body);
    });
  };

  //
  // ## Parse challenge digest
  //
  HTTPDigest.prototype._parseChallenge = function parseChallenge(digest) {
    var prefix = 'Digest ';
    var challenge = digest.substr(digest.indexOf(prefix) + prefix.length);
    var parts = challenge.split(',');
    var length = parts.length;
    var params = {};
    for (var i = 0; i < length; i++) {
      var part = parts[i].match(/^\s*?([a-zA-Z0-0]+)=("(.*)"|MD5)\s*?$/);
      if (part.length > 2) {
        params[part[1]] = part[2].replace(/\"/g, '');
      }
    }

    return params;
  };

  //
  // ## Parse challenge digest
  //
  HTTPDigest.prototype._generateCNONCE = function generateCNONCE(qop) {
    var cnonce = false;
    var nc = false;
    if (typeof qop === 'string') {
      var cnonceHash = crypto.createHash('md5');
      cnonceHash.update(Math.random().toString(36));
      cnonce = cnonceHash.digest('hex').substr(0, 8);
      nc = this.updateNC();
    }

    return { cnonce: cnonce, nc: nc };
  };

  //
  // ## Compose authorization header
  //
  HTTPDigest.prototype._compileParams = function compileParams(params) {
    var parts = [];
    for (var i in params) {
      parts.push(i + '=' + (putDoubleQuotes(i) ? '"' : '') + params[i] + (putDoubleQuotes(i) ? '"' : ''));
    }
    return 'Digest ' + parts.join(',');
  };

  //
  // ## Exclude double quotes with some params
  //
  function putDoubleQuotes(i) {
    var excludeList = ['qop', 'nc'];
    return (_.includes(excludeList, i) ? true : false);
  }

  //
  // ## Update and zero pad nc
  //
  HTTPDigest.prototype.updateNC = function updateNC() {
    var max = 99999999;
    this.nc++;
    if (this.nc > max) {
      this.nc = 1;
    }
    var padding = new Array(8).join('0') + '';
    var nc = this.nc + '';
    return padding.substr(0, 8 - nc.length) + nc;
  };

  // Return response handler
  return HTTPDigest;
}();

module.exports = function _createDigestClient(username, password) {
  return new HTTPDigest(username, password);
};

