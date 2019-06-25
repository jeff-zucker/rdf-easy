'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _require = require('whatwg-url'),
    URL = _require.URL;

var _require2 = require('@solid/jose'),
    JWT = _require2.JWT,
    JWK = _require2.JWK;

var DEFAULT_MAX_AGE = 3600; // Default token expiration, in seconds

var PoPToken = function (_JWT) {
  _inherits(PoPToken, _JWT);

  function PoPToken() {
    _classCallCheck(this, PoPToken);

    return _possibleConstructorReturn(this, (PoPToken.__proto__ || Object.getPrototypeOf(PoPToken)).apply(this, arguments));
  }

  _createClass(PoPToken, null, [{
    key: 'issueFor',

    /**
     * @param resourceServerUri {string} RS URI for which this token is intended
     *
     * @param session {Session}
     * @param session.sessionKey {string}
     * @param session.authorization.client_id {string}
     * @param session.authorization.id_token {string}
     *
     * @returns {Promise<string>} PoPToken, encoded as compact JWT
     */
    value: function issueFor(resourceServerUri, session) {
      if (!resourceServerUri) {
        throw new Error('Cannot issue PoPToken - missing resource server URI');
      }

      if (!session.sessionKey) {
        throw new Error('Cannot issue PoPToken - missing session key');
      }

      if (!session.authorization.id_token) {
        throw new Error('Cannot issue PoPToken - missing id token');
      }

      var jwk = JSON.parse(session.sessionKey);

      return JWK.importKey(jwk).then(function (importedSessionJwk) {
        var options = {
          aud: new URL(resourceServerUri).origin,
          key: importedSessionJwk,
          iss: session.authorization.client_id,
          id_token: session.authorization.id_token
        };

        return PoPToken.issue(options);
      }).then(function (jwt) {
        return jwt.encode();
      });
    }

    /**
     * issue
     *
     * @param options {Object}
     * @param options.iss {string} Token issuer (RP client_id)
     * @param options.aud {string|Array<string>} Audience for the token
     *   (such as the Resource Server url)
     * @param options.key {JWK} Proof of Possession (private) signing key, see
     *   https://tools.ietf.org/html/rfc7800#section-3.1
     *
     * @param options.id_token {string} JWT compact encoded ID Token
     *
     * Optional:
     * @param [options.iat] {number} Issued at timestamp (in seconds)
     * @param [options.max] {number} Max token lifetime in seconds
     *
     * @returns {PoPToken} Proof of Possession Token (JWT instance)
     */

  }, {
    key: 'issue',
    value: function issue(options) {
      var aud = options.aud,
          iss = options.iss,
          key = options.key;


      var alg = key.alg;
      var iat = options.iat || Math.floor(Date.now() / 1000);
      var max = options.max || DEFAULT_MAX_AGE;

      var exp = iat + max; // token expiration

      var header = { alg: alg };
      var payload = { iss: iss, aud: aud, exp: exp, iat: iat, id_token: options.id_token, token_type: 'pop' };

      var jwt = new PoPToken({ header: header, payload: payload, key: key.cryptoKey }, { filter: false });

      return jwt;
    }
  }]);

  return PoPToken;
}(JWT);

module.exports = PoPToken;