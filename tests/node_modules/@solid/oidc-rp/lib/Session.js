'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var fetch = require('node-fetch');
var onHttpError = require('./onHttpError');
var PoPToken = require('./PoPToken');

var Session = function () {
  /**
   * @param options {Object}
   *
   * @param options.credentialType {string} 'access_token' or 'pop_token'
   *
   * @param options.issuer {string} Identity provider (issuer of ID/Access Token)
   *
   * @param options.authorization {object}
   * @param options.authorization.client_id {string} OIDC/OAuth2 client id
   * @param [options.authorization.id_token] {string} Compact-serialized id_token param
   * @param [options.authorization.access_token] {string} Compact-serialized access_token param
   * @param [options.authorization.refresh_token] {string} Compact-serialized refresh_token
   *
   * @param [options.sessionKey] {string} Serialized client session key generated
   *   during the Authentication Request, used to issue PoPTokens
   *
   * @param [options.idClaims] {object} Decoded/verified ID Token JWT payload
   *
   * @param [options.accessClaims] {object} Decoded/verified Access Token JWT payload
   */
  function Session(options) {
    _classCallCheck(this, Session);

    this.credentialType = options.credentialType || 'access_token';

    this.issuer = options.issuer;

    this.authorization = options.authorization || {};

    this.sessionKey = options.sessionKey;

    this.idClaims = options.idClaims;
    this.accessClaims = options.accessClaims;
  }

  _createClass(Session, [{
    key: 'bearerTokenFor',


    /**
     * bearerTokenFor
     *
     * @param url {string}
     *
     * @returns {Promise<string>}
     */
    value: function bearerTokenFor(url) {
      switch (this.credentialType) {
        case 'pop_token':
          return PoPToken.issueFor(url, this);

        default:
          // 'access_token' etc
          return Promise.resolve(this.authorization[this.credentialType]);
      }
    }

    /**
     * hasCredentials
     *
     * @returns {boolean}
     */

  }, {
    key: 'hasCredentials',
    value: function hasCredentials() {
      switch (this.credentialType) {
        case 'pop_token':
          return !!this.authorization['id_token'];

        default:
          // 'access_token' etc
          return !!this.authorization[this.credentialType];
      }
    }

    /**
     * fetchWithCredentials
     *
     * @param url {RequestInfo|string}
     * @param options {object}
     *
     * @returns {Promise<Response>}
     */

  }, {
    key: 'fetchWithCredentials',
    value: function fetchWithCredentials(url) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      options.headers = options.headers || {};

      return this.bearerTokenFor(url).then(function (token) {
        options.headers.authorization = 'Bearer ' + token;

        return fetch(url, options);
      });
    }
  }, {
    key: 'fetch',


    /**
     * Authenticated fetch() getter
     *
     * @returns {function}
     */
    get: function get() {
      var _this = this;

      /**
       * fetch() function signature
       *
       * @param url {RequestInfo|string}
       * @param options {object}
       *
       * @returns {Function<Promise<Response>>}
       */
      return function (url, options) {
        return Promise.resolve().then(function () {
          if (_this.hasCredentials()) {
            return _this.fetchWithCredentials(url, options);
          } else {
            return fetch(url, options);
          }
        }).then(onHttpError('Error while fetching resource'));
      };
    }
  }], [{
    key: 'from',
    value: function from(options) {
      return new Session(options);
    }

    /**
     * @param response {AuthenticationResponse}
     *
     * @returns {Session} RelyingParty Session object
     */

  }, {
    key: 'fromAuthResponse',
    value: function fromAuthResponse(response) {
      var RelyingParty = require('./RelyingParty'); // import here due to circular dep

      var idClaims = response.decoded && response.decoded.payload || {};

      var rp = response.rp;


      var registration = rp.registration;
      var rpAuthOptions = rp.defaults.authenticate || {};

      var credentialType = rpAuthOptions['credential_type'] || rp.defaults.popToken ? 'pop_token' : 'access_token';

      var sessionKey = response.session[RelyingParty.SESSION_PRIVATE_KEY];

      var options = {
        credentialType: credentialType,
        sessionKey: sessionKey,
        issuer: idClaims.iss,
        idClaims: idClaims,
        authorization: {
          client_id: registration['client_id'],
          access_token: response.params['access_token'],
          id_token: response.params['id_token'],
          refresh_token: response.params['refresh_token']
        }
      };

      return Session.from(options);
    }
  }]);

  return Session;
}();

module.exports = Session;