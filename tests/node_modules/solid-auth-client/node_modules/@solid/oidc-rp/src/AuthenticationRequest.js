/**
 * Dependencies
 */
const assert = require('assert')
const base64url = require('base64url')
const crypto = require('@trust/webcrypto')
const { JWT } = require('@solid/jose')
const FormUrlEncoded = require('./FormUrlEncoded')
const { URL } = require('whatwg-url')

/**
 * Authentication Request
 */
class AuthenticationRequest {
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
  static create (rp, options, session) {
    const {provider, defaults, registration} = rp

    let issuer, endpoint, client, params

    return Promise.resolve()
      .then(() => {
        // validate presence of OP configuration, RP client registration,
        // and default parameters
        assert(provider.configuration,
          'RelyingParty provider OpenID Configuration is missing')

        assert(defaults.authenticate,
          'RelyingParty default authentication parameters are missing')

        assert(registration,
          'RelyingParty client registration is missing')

        // define basic elements of the request
        issuer = provider.configuration.issuer
        endpoint = provider.configuration.authorization_endpoint
        client = { client_id: registration.client_id}
        params = Object.assign(defaults.authenticate, client, options)

        // validate presence of required configuration and parameters
        assert(issuer,
          'Missing issuer in provider OpenID Configuration')

        assert(endpoint,
          'Missing authorization_endpoint in provider OpenID Configuration')

        assert(params.scope,
          'Missing scope parameter in authentication request')

        assert(params.response_type,
          'Missing response_type parameter in authentication request')

        assert(params.client_id,
          'Missing client_id parameter in authentication request')

        assert(params.redirect_uri,
          'Missing redirect_uri parameter in authentication request')

        // generate state and nonce random octets
        params.state = Array.from(crypto.getRandomValues(new Uint8Array(16)))
        params.nonce = Array.from(crypto.getRandomValues(new Uint8Array(16)))

        // hash the state and nonce parameter values
        return Promise.all([
          crypto.subtle.digest({ name: 'SHA-256' }, new Uint8Array(params.state)),
          crypto.subtle.digest({ name: 'SHA-256' }, new Uint8Array(params.nonce))
        ])
      })

      // serialize the request with original values, store in session by
      // encoded state param, and replace state/nonce octets with encoded
      // digests
      .then(digests => {
        let state = base64url(Buffer.from(digests[0]))
        let nonce = base64url(Buffer.from(digests[1]))
        let key = `${issuer}/requestHistory/${state}`

        // store the request params for response validation
        // with serialized octet values for state and nonce
        session[key] = JSON.stringify(params)

        // replace state and nonce octets with base64url encoded digests
        params.state = state
        params.nonce = nonce
      })

      .then(() => AuthenticationRequest.generateSessionKeys())

      .then(sessionKeys => {
        AuthenticationRequest.storeSessionKeys(sessionKeys, params, session)
      })

      // optionally encode a JWT with the request parameters
      // and replace params with `{ request: <jwt> }
      .then(() => {
        if (provider.configuration.request_parameter_supported) {
          return AuthenticationRequest.encodeRequestParams(params)

            .then(encodedParams => { params = encodedParams })
        }
      })

      // render the request URI and terminate the algorithm
      .then(() => {
        let url = new URL(endpoint)
        url.search = FormUrlEncoded.encode(params)

        return url.href
      })
  }

  static generateSessionKeys () {
    return crypto.subtle.generateKey(
      {
        name: "RSASSA-PKCS1-v1_5",
        modulusLength: 2048,
        publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
        hash: { name: "SHA-256" },
      },
      true,
      ["sign", "verify"]
    )
      .then((keyPair) => {
        // returns a keypair object
        return Promise.all([
          crypto.subtle.exportKey('jwk', keyPair.publicKey),
          crypto.subtle.exportKey('jwk', keyPair.privateKey)
        ])
      })
      .then(jwkPair => {
        let [ publicJwk, privateJwk ] = jwkPair

        return { public: publicJwk, private: privateJwk }
      })
  }

  static storeSessionKeys (sessionKeys, params, session) {
    // store the private one in session, public one goes into params
    session['oidc.session.privateKey'] = JSON.stringify(sessionKeys.private)
    params.key = sessionKeys.public
  }

  static encodeRequestParams (params) {
    const excludeParams = ['scope', 'client_id', 'response_type', 'state']

    const keysToEncode = Object.keys(params).filter(key => !excludeParams.includes(key))

    let payload = {}

    keysToEncode.forEach(key => {
      payload[key] = params[key]
    })

    let requestParamJwt = new JWT({
      header: { alg: 'none' },
      payload
    }, { filter: false })

    return requestParamJwt.encode()
      .then(requestParamCompact => {
        let newParams = {
          scope: params['scope'],
          client_id: params['client_id'],
          response_type: params['response_type'],
          request: requestParamCompact,
          state: params['state']
        }

        return newParams
      })
  }
}

/**
 * Export
 */
module.exports = AuthenticationRequest
