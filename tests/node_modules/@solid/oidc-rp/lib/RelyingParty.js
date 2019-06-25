'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * Dependencies
 */
var assert = require('assert');
var fetch = require('node-fetch');

var _require = require('whatwg-url'),
    URL = _require.URL;

var Headers = fetch.Headers ? fetch.Headers : global.Headers;

var _require2 = require('@trust/json-document'),
    JSONDocument = _require2.JSONDocument;

var _require3 = require('@solid/jose'),
    JWKSet = _require3.JWKSet;

var AuthenticationRequest = require('./AuthenticationRequest');
var AuthenticationResponse = require('./AuthenticationResponse');
var RelyingPartySchema = require('./RelyingPartySchema');
var onHttpError = require('./onHttpError');
var FormUrlEncoded = require('./FormUrlEncoded');

/**
 * RelyingParty
 *
 * @class
 * Client interface for OpenID Connect Relying Party.
 *
 * @example
 *  let client = RelyingParty({
 *    provider: {
 *      name: 'Anvil Research, Inc.',
 *      url: 'https://forge.anvil.io'
 *      // configuration
 *      // jwks
 *    },
 *    defaults: {
 *      popToken: false,
 *      authenticate: {
 *        response_type: 'code',
 *        display: 'popup',
 *        scope: 'openid profile email'
 *      },
 *      register: {
 *        client_name: 'Example',
 *        client_uri: 'https://example.com',
 *        logo_uri: 'https://example.com/assets/logo.png',
 *        redirect_uris: ['https://app.example.com/callback'],
 *        response_types: ['code', 'code id_token token'],
 *        grant_types: ['authorization_code'],
 *        default_max_age: 7200,
 *        post_logout_redirect_uris: ['https://app.example.com']
 *      },
 *    },
 *    registration: {
 *      // if you have it saved somewhere
 *    },
 *    store: localStorage || req.session
 *  })
 *
 *  client.discover() => Promise
 *  client.jwks() => Promise
 *  client.authenticate()
 *  client.authenticateUri()
 *  client.validateResponse(uri) => Promise
 *  client.userinfo() => Promise
 *  client.logout()
 */

var RelyingParty = function (_JSONDocument) {
  _inherits(RelyingParty, _JSONDocument);

  function RelyingParty() {
    _classCallCheck(this, RelyingParty);

    return _possibleConstructorReturn(this, (RelyingParty.__proto__ || Object.getPrototypeOf(RelyingParty)).apply(this, arguments));
  }

  _createClass(RelyingParty, [{
    key: 'discover',


    /**
     * Discover
     *
     * @description Fetches the issuer's OpenID Configuration.
     * @returns {Promise<Object>} Resolves with the provider configuration response
     */
    value: function discover() {
      var _this2 = this;

      try {
        var issuer = this.provider.url;

        assert(issuer, 'RelyingParty provider must define "url"');

        var url = new URL(issuer);
        url.pathname = '.well-known/openid-configuration';

        return fetch(url.toString()).then(onHttpError('Error fetching openid configuration')).then(function (response) {
          return response.json().then(function (json) {
            return _this2.provider.configuration = json;
          });
        });
      } catch (error) {
        return Promise.reject(error);
      }
    }

    /**
     * Register
     *
     * @description Register's a client with provider as a Relying Party
     *
     * @param options {Object}
     * @returns {Promise<Object>} Resolves with the registration response object
     */

  }, {
    key: 'register',
    value: function register(options) {
      var _this3 = this;

      try {
        var configuration = this.provider.configuration;

        assert(configuration, 'OpenID Configuration is not initialized.');
        assert(configuration.registration_endpoint, 'OpenID Configuration is missing registration_endpoint.');

        var uri = configuration.registration_endpoint;
        var method = 'post';
        var headers = new Headers({ 'Content-Type': 'application/json' });
        var params = this.defaults.register;
        var body = JSON.stringify(Object.assign({}, params, options));

        return fetch(uri, { method: method, headers: headers, body: body }).then(onHttpError('Error registering client')).then(function (response) {
          return response.json().then(function (json) {
            return _this3.registration = json;
          });
        });
      } catch (error) {
        return Promise.reject(error);
      }
    }
  }, {
    key: 'serialize',
    value: function serialize() {
      return JSON.stringify(this);
    }

    /**
     * @description 
     * Retrieves an existing Relying Party registration for a provider which does 
     * not support dynamic registration and which requires pre-registration by
     * some 'out of band' method.
     *
     * @param options {Object}
     * @param idp {string} Key identifying which registration data should be retrieved.
     * @returns {Promise<Object>} Resolves with the registration response object.
     */

  }, {
    key: 'getRegistration',
    value: function getRegistration(options, idp, oobRegistration) {
      var _this4 = this;

      return Promise.resolve().then(function () {
        return _this4.registration = oobRegistration.getRegistration(idp);
      }).catch(function (error) {
        throw error;
      });
    }

    /**
     * jwks
     *
     * @description Promises the issuer's JWK Set.
     * @returns {Promise}
     */

  }, {
    key: 'jwks',
    value: function jwks() {
      var _this5 = this;

      try {
        var configuration = this.provider.configuration;

        assert(configuration, 'OpenID Configuration is not initialized.');
        assert(configuration.jwks_uri, 'OpenID Configuration is missing jwks_uri.');

        var uri = configuration.jwks_uri;

        return fetch(uri).then(onHttpError('Error resolving provider keys')).then(function (response) {
          return response.json().then(function (json) {
            return JWKSet.importKeys(json);
          }).then(function (jwks) {
            return _this5.provider.jwks = jwks;
          });
        });
      } catch (error) {
        return Promise.reject(error);
      }
    }

    /**
     * createRequest
     *
     * @param options {Object} Authn request options hashmap
     * @param options.redirect_uri {string}
     * @param options.response_type {string} e.g. 'code' or 'id_token token'
     * @param session {Session|Storage} req.session or localStorage
     * @returns {Promise<string>} Authn request URL
     */

  }, {
    key: 'createRequest',
    value: function createRequest(options, session) {
      return AuthenticationRequest.create(this, options, session || this.store);
    }

    /**
     * Validate Response
     *
     * @param response {string} req.query or req.body.text
     * @param session {Session|Storage} req.session or localStorage or similar
     *
     * @returns {Promise<Session>}
     */

  }, {
    key: 'validateResponse',
    value: function validateResponse(response) {
      var session = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.store;

      var options = void 0;

      if (response.match(/^http(s?):\/\//)) {
        options = { rp: this, redirect: response, session: session };
      } else {
        options = { rp: this, body: response, session: session };
      }

      var authResponse = new AuthenticationResponse(options);

      return AuthenticationResponse.validateResponse(authResponse);
    }

    /**
     * userinfo
     *
     * @description
     * Promises the authenticated user's claims.
     * access_token can be supplied directly. If not, it is retrieved from storage, if available. 
     * Depending on when userinfo is called, access_token may not yet have been saved to storage.
     *
     * @param accessToken {string=} Optional access token from current user session for use against the User Info endpoint
     * @returns {Promise}
     */

  }, {
    key: 'userinfo',
    value: function userinfo(accessToken) {
      try {
        var configuration = this.provider.configuration;

        assert(configuration, 'OpenID Configuration is not initialized.');
        assert(configuration.userinfo_endpoint, 'OpenID Configuration is missing userinfo_endpoint.');

        accessToken = accessToken || this.store.access_token;
        assert(accessToken, 'Missing access token.');

        var uri = configuration.userinfo_endpoint;
        var headers = new Headers({
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + accessToken
        });

        return fetch(uri, { headers: headers }).then(onHttpError('Error fetching userinfo')).then(function (response) {
          return response.json();
        });
      } catch (error) {
        return Promise.reject(error);
      }
    }

    /**
     * logoutRequest
     *
     * Composes and returns the logout request URI, based on the OP's
     * `end_session_endpoint`, with appropriate parameters.
     *
     * Note: Calling client code has the responsibility to clear the local
     * session state (for example, by calling `rp.clearSession()`). In addition,
     * some IdPs (such as Google) may not provide an `end_session_endpoint`,
     * in which case, this method will return null.
     *
     * @see https://openid.net/specs/openid-connect-session-1_0.html#RPLogout
     *
     * @throws {Error} If provider config is not initialized
     *
     * @throws {Error} If `post_logout_redirect_uri` was provided without a
     *   corresponding `id_token_hint`
     *
     * @param [options={}] {object}
     *
     * @param [options.id_token_hint] {string} RECOMMENDED.
     *   Previously issued ID Token passed to the logout endpoint as
     *   a hint about the End-User's current authenticated session with the
     *   Client. This is used as an indication of the identity of the End-User
     *   that the RP is requesting be logged out by the OP. The OP *need not* be
     *   listed as an audience of the ID Token when it is used as an
     *   `id_token_hint` value.
     *
     * @param [options.post_logout_redirect_uri] {string} OPTIONAL. URL to which
     *   the RP is requesting that the End-User's User Agent be redirected after
     *   a logout has been performed. The value MUST have been previously
     *   registered with the OP, either using the `post_logout_redirect_uris`
     *   Registration parameter or via another mechanism. If supplied, the OP
     *   SHOULD honor this request following the logout.
     *
     *   Note: The requirement to validate the uri for previous registration means
     *   that, in practice, the `id_token_hint` is REQUIRED if
     *   `post_logout_redirect_uri` is used. Otherwise, the OP has no way to get
     *   the `client_id` to load the saved client registration, to validate the
     *   uri. The only way it can get it is by decoding the `id_token_hint`.
     *
     * @param [options.state] {string} OPTIONAL. Opaque value used by the RP to
     *   maintain state between the logout request and the callback to the
     *   endpoint specified by the `post_logout_redirect_uri` query parameter. If
     *   included in the logout request, the OP passes this value back to the RP
     *   using the `state` query parameter when redirecting the User Agent back to
     *   the RP.
     *
     * TODO: In the future, consider adding `response_mode` param, for the OP to
     *   determine how to return the `state` back the RP.
     *   @see http://openid.net/specs/oauth-v2-multiple-response-types-1_0.html#ResponseModes
     *
     * TODO: Handle special cases for popular providers (Google, MSFT)
     *
     * @returns {string|null} Logout uri (or null if no end_session_endpoint was
     *   provided in the IdP config)
     */

  }, {
    key: 'logoutRequest',
    value: function logoutRequest() {
      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      var id_token_hint = options.id_token_hint,
          post_logout_redirect_uri = options.post_logout_redirect_uri,
          state = options.state;

      var configuration = void 0;

      assert(this.provider, 'OpenID Configuration is not initialized');
      configuration = this.provider.configuration;
      assert(configuration, 'OpenID Configuration is not initialized');

      if (!configuration.end_session_endpoint) {
        console.log('OpenId Configuration for ' + (configuration.issuer + ' is missing end_session_endpoint'));
        return null;
      }

      if (post_logout_redirect_uri && !id_token_hint) {
        throw new Error('id_token_hint is required when using post_logout_redirect_uri');
      }

      var params = {};

      if (id_token_hint) {
        params.id_token_hint = id_token_hint;
      }
      if (post_logout_redirect_uri) {
        params.post_logout_redirect_uri = post_logout_redirect_uri;
      }
      if (state) {
        params.state = state;
      }

      var url = new URL(configuration.end_session_endpoint);
      url.search = FormUrlEncoded.encode(params);

      return url.href;
    }

    /**
     * Logout
     *
     * @deprecated
     *
     * TODO: Add deprecation warnings, then remove. Client code should
     *   use `logoutRequest()` instead
     *
     * @returns {Promise}
     */

  }, {
    key: 'logout',
    value: function logout() {
      var _this6 = this;

      var configuration = void 0;
      try {
        assert(this.provider, 'OpenID Configuration is not initialized.');
        configuration = this.provider.configuration;
        assert(configuration, 'OpenID Configuration is not initialized.');
      } catch (error) {
        return Promise.reject(error);
      }

      if (!configuration.end_session_endpoint) {
        this.clearSession();
        return Promise.resolve(undefined);
      }

      var uri = configuration.end_session_endpoint;
      var method = 'get';

      return fetch(uri, { method: method, credentials: 'include' }).then(onHttpError('Error logging out')).then(function () {
        return _this6.clearSession();
      });

      // TODO: Validate `frontchannel_logout_uri` if necessary
      /**
       * frontchannel_logout_uri - OPTIONAL. RP URL that will cause the RP to log
       * itself out when rendered in an iframe by the OP.
       *
       * An `iss` (issuer) query parameter and a `sid`
       * (session ID) query parameter MAY be included by the OP to enable the RP
       * to validate the request and to determine which of the potentially
       * multiple sessions is to be logged out. If a sid (session ID) query
       * parameter is included, an iss (issuer) query parameter MUST also be
       * included.
       * @see https://openid.net/specs/openid-connect-frontchannel-1_0.html#RPLogout
       */
    }
  }, {
    key: 'clearSession',
    value: function clearSession() {
      var session = this.store;

      if (!session) {
        return;
      }

      delete session[SESSION_PRIVATE_KEY];
    }

    /**
     * @param uri {string} Target Resource Server URI
     * @param idToken {IDToken} ID Token to be embedded in the PoP token
     *
     * @returns {Promise<PoPToken>}
     */

  }, {
    key: 'popTokenFor',
    value: function popTokenFor(uri, idToken) {
      return PoPToken.issueFor(uri, idToken);
    }
  }], [{
    key: 'from',


    /**
     * from
     *
     * @description
     * Create a RelyingParty instance from a previously registered client.
     *
     * @param {Object} data
     * @returns {Promise<RelyingParty>}
     */
    value: function from(data) {
      var rp = new RelyingParty(data);
      var validation = rp.validate();

      // schema validation
      if (!validation.valid) {
        return Promise.reject(new Error(JSON.stringify(validation)));
      }

      var jwks = rp.provider.jwks;

      // request the JWK Set if missing
      if (!jwks) {
        return rp.jwks().then(function () {
          return rp;
        });
      }

      // otherwise import the JWK Set to webcrypto
      return JWKSet.importKeys(jwks).then(function (jwks) {
        rp.provider.jwks = jwks;
        return rp;
      });
    }

    /**
     * register
     *
     * @param issuer {string} Provider URL
     * @param registration {Object} Client dynamic registration options
     * @param options {Object}
     * @param options.defaults
     * @param [options.store] {Session|Storage}
     * @param [oobRegistration] {Object} Object providing getRegistration(key) function for out-of-band registrations
     * @param [idpId] {string} A tag identifying the provider used for looking up out-of-band registration data.
     * @returns {Promise<RelyingParty>} RelyingParty instance, registered.
     */

  }, {
    key: 'register',
    value: function register(issuer, registration, options, idpId, oobRegistration) {
      var rp = new RelyingParty({
        provider: { url: issuer },
        defaults: Object.assign({}, options.defaults),
        store: options.store
      });

      return Promise.resolve().then(function () {
        return rp.discover();
      }).then(function () {
        return rp.jwks();
      }).then(function () {
        assert(rp.provider.configuration, 'OpenID Configuration is not initialized.');
        return rp.provider.configuration.registration_endpoint ? rp.register(registration) : rp.getRegistration(registration, idpId, oobRegistration);
      }).then(function () {
        return rp;
      });
    }
  }, {
    key: 'schema',


    /**
     * Schema
     */
    get: function get() {
      return RelyingPartySchema;
    }
  }]);

  return RelyingParty;
}(JSONDocument);

var SESSION_PRIVATE_KEY = 'oidc.session.privateKey';

RelyingParty.SESSION_PRIVATE_KEY = SESSION_PRIVATE_KEY;

module.exports = RelyingParty;