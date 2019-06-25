'use strict'

const { URL } = require('whatwg-url')
const {JWT, JWK} = require('@solid/jose')

const DEFAULT_MAX_AGE = 3600  // Default token expiration, in seconds

class PoPToken extends JWT {
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
  static issueFor (resourceServerUri, session) {
    if (!resourceServerUri) {
      throw new Error('Cannot issue PoPToken - missing resource server URI')
    }

    if (!session.sessionKey) {
      throw new Error('Cannot issue PoPToken - missing session key')
    }

    if (!session.authorization.id_token) {
      throw new Error('Cannot issue PoPToken - missing id token')
    }

    let jwk = JSON.parse(session.sessionKey)

    return JWK.importKey(jwk)
      .then(importedSessionJwk => {
        let options = {
          aud: (new URL(resourceServerUri)).origin,
          key: importedSessionJwk,
          iss: session.authorization.client_id,
          id_token: session.authorization.id_token
        }

        return PoPToken.issue(options)
      })
      .then(jwt => {
        return jwt.encode()
      })
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
  static issue (options) {
    let { aud, iss, key } = options

    let alg = key.alg
    let iat = options.iat || Math.floor(Date.now() / 1000)
    let max = options.max || DEFAULT_MAX_AGE

    let exp = iat + max  // token expiration

    let header = { alg }
    let payload = { iss, aud, exp, iat, id_token: options.id_token, token_type: 'pop' }

    let jwt = new PoPToken({ header, payload, key: key.cryptoKey }, { filter: false })

    return jwt
  }
}

module.exports = PoPToken
