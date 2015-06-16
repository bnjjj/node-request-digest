'use strict';
var expect = require('chai').expect;
var requestDigest = require('../request-digest')(process.env.USER, process.env.PASS);

describe('+ Unit tests : ', function () {
	it('- Initialisation :', function (done) {
		expect(requestDigest.nc).to.equal(0);
		expect(requestDigest.username).to.equal(process.env.USER);
		expect(requestDigest.password).to.equal(process.env.PASS);
		done();
	});

	it('- Parse digest response : ', function (done) {
		var challenge = requestDigest._parseDigestResponse('Digest realm="testprod",' + 
			' nonce="LHkM1pEYBQA=d859c4f627964018a7c3cab1e07b38f630a67623", algorithm=MD5, qop="auth"');
		expect(challenge.realm).to.equal('testprod');
		expect(challenge.nonce).to.equal('LHkM1pEYBQA=d859c4f627964018a7c3cab1e07b38f630a67623');
		expect(challenge.algorithm).to.equal('MD5');
		expect(challenge.qop).to.equal('auth');
		done();
	});

  it('- Compile params : ', function (done) {
  	var params = { username: 'genae',
		  realm: 'testprod',
		  nonce: 'DIEguqcYBQA=774c1d2e307243433d',
		  uri: '/rest/test/v1/test?offset=0&size=100',
		  qop: 'auth',
		  response: 'e69dea8ec16ea1187a3123',
		  nc: '00000001',
		  cnonce: 'dbe34' };
		var header = 'Digest username=genae,realm=testprod,nonce=DIEguqcYBQA=774c1d2e307243433d,' + 
			'uri=/rest/test/v1/test?offset=0&size=100,qop="auth",response=e69dea8ec16ea1187a3123,' + 
				'nc="00000001",cnonce=dbe34';

		expect(requestDigest._compileParams(params)).to.equal(header);
  	done();
  });

  it('- PutDoubleQuotes : ', function (done) {
  	expect(requestDigest._putDoubleQuotes('qop')).to.equal(true);
  	expect(requestDigest._putDoubleQuotes('nc')).to.equal(true);
  	expect(requestDigest._putDoubleQuotes('nonce')).to.equal(false);
  	done();
  });
});
