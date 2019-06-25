'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Dependencies
 */
var assert = require('assert');
var base64url = require('base64url');
var crypto = require('@trust/webcrypto');

var _require = require('@solid/jose'),
    JWT = _require.JWT;

var FormUrlEncoded = require('./FormUrlEncoded');

var _require2 = require('whatwg-url'),
    URL = _require2.URL;

/**
 * Authentication Request
 */


var AuthenticationRequest = function () {
  function AuthenticationRequest() {
    _classCallCheck(this, AuthenticationRequest);
  }

  _createClass(AuthenticationRequest, null, [{
    key: 'create',

    /**
     * create
     *
     * @description
     * Create a new authentication request with generated state and nonce,
     * validate presence of required parameters, serialize the request data and
     * persist it to the session, and return a promise for an authentication
     * request URI.
     *
     * @param {RelyingParty} rp – instance of RelyingParty
     * @param {Object} options - optional request parameters
     * @param {Object} session – reference to localStorage or other session object
     *
     * @returns {Promise}
     */
    value: function create(rp, options, session) {
      var provider = rp.provider,
          defaults = rp.defaults,
          registration = rp.registration;


      var issuer = void 0,
          endpoint = void 0,
          client = void 0,
          params = void 0;

      return Promise.resolve().then(function () {
        // validate presence of OP configuration, RP client registration,
        // and default parameters
        assert(provider.configuration, 'RelyingParty provider OpenID Configuration is missing');

        assert(defaults.authenticate, 'RelyingParty default authentication parameters are missing');

        assert(registration, 'RelyingParty client registration is missing');

        // define basic elements of the request
        issuer = provider.configuration.issuer;
        endpoint = provider.configuration.authorization_endpoint;
        client = { client_id: registration.client_id };
        params = Object.assign(defaults.authenticate, client, options);

        // validate presence of required configuration and parameters
        assert(issuer, 'Missing issuer in provider OpenID Configuration');

        assert(endpoint, 'Missing authorization_endpoint in provider OpenID Configuration');

        assert(params.scope, 'Missing scope parameter in authentication request');

        assert(params.response_type, 'Missing response_type parameter in authentication request');

        assert(params.client_id, 'Missing client_id parameter in authentication request');

        assert(params.redirect_uri, 'Missing redirect_uri parameter in authentication request');

        // generate state and nonce random octets
        params.state = Array.from(crypto.getRandomValues(new Uint8Array(16)));
        params.nonce = Array.from(crypto.getRandomValues(new Uint8Array(16)));

        // hash the state and nonce parameter values
        return Promise.all([crypto.subtle.digest({ name: 'SHA-256' }, new Uint8Array(params.state)), crypto.subtle.digest({ name: 'SHA-256' }, new Uint8Array(params.nonce))]);
      })

      // serialize the request with original values, store in session by
      // encoded state param, and replace state/nonce octets with encoded
      // digests
      .then(function (digests) {
        var state = base64url(Buffer.from(digests[0]));
        var nonce = base64url(Buffer.from(digests[1]));
        var key = issuer + '/requestHistory/' + state;

        // store the request params for response validation
        // with serialized octet values for state and nonce
        session[key] = JSON.stringify(params);

        // replace state and nonce octets with base64url encoded digests
        params.state = state;
        params.nonce = nonce;
      }).then(function () {
        return AuthenticationRequest.generateSessionKeys();
      }).then(function (sessionKeys) {
        AuthenticationRequest.storeSessionKeys(sessionKeys, params, session);
      })

      // optionally encode a JWT with the request parameters
      // and replace params with `{ request: <jwt> }
      .then(function () {
        if (provider.configuration.request_parameter_supported) {
          return AuthenticationRequest.encodeRequestParams(params).then(function (encodedParams) {
            params = encodedParams;
          });
        }
      })

      // render the request URI and terminate the algorithm
      .then(function () {
        var url = new URL(endpoint);
        url.search = FormUrlEncoded.encode(params);

        return url.href;
      });
    }
  }, {
    key: 'generateSessionKeys',
    value: function generateSessionKeys() {
      return crypto.subtle.generateKey({
        name: "RSASSA-PKCS1-v1_5",
        modulusLength: 2048,
        publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
        hash: { name: "SHA-256" }
      }, true, ["sign", "verify"]).then(function (keyPair) {
        // returns a keypair object
        return Promise.all([crypto.subtle.exportKey('jwk', keyPair.publicKey), crypto.subtle.exportKey('jwk', keyPair.privateKey)]);
      }).then(function (jwkPair) {
        var _jwkPair = _slicedToArray(jwkPair, 2),
            publicJwk = _jwkPair[0],
            privateJwk = _jwkPair[1];

        return { public: publicJwk, private: privateJwk };
      });
    }
  }, {
    key: 'storeSessionKeys',
    value: function storeSessionKeys(sessionKeys, params, session) {
      // store the private one in session, public one goes into params
      session['oidc.session.privateKey'] = JSON.stringify(sessionKeys.private);
      params.key = sessionKeys.public;
    }
  }, {
    key: 'encodeRequestParams',
    value: function encodeRequestParams(params) {
      var excludeParams = ['scope', 'client_id', 'response_type', 'state'];

      var keysToEncode = Object.keys(params).filter(function (key) {
        return !excludeParams.includes(key);
      });

      var payload = {};

      keysToEncode.forEach(function (key) {
        payload[key] = params[key];
      });

      var requestParamJwt = new JWT({
        header: { alg: 'none' },
        payload: payload
      }, { filter: false });

      return requestParamJwt.encode().then(function (requestParamCompact) {
        var newParams = {
          scope: params['scope'],
          client_id: params['client_id'],
          response_type: params['response_type'],
          request: requestParamCompact,
          state: params['state']
        };

        return newParams;
      });
    }
  }]);

  return AuthenticationRequest;
}();

/**
 * Export
 */


module.exports = AuthenticationRequest;