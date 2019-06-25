/**
 * Dependencies
 */
const assert = require('assert')
const fetch = require('node-fetch')
const { URL } = require('whatwg-url')
const Headers = fetch.Headers ? fetch.Headers : global.Headers
const {JSONDocument} = require('@trust/json-document')
const {JWKSet} = require('@solid/jose')
const AuthenticationRequest = require('./AuthenticationRequest')
const AuthenticationResponse = require('./AuthenticationResponse')
const RelyingPartySchema = require('./RelyingPartySchema')
const onHttpError = require('./onHttpError')
const FormUrlEncoded = require('./FormUrlEncoded')

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
class RelyingParty extends JSONDocument {

  /**
   * Schema
   */
  static get schema () {
    return RelyingPartySchema
  }

  /**
   * from
   *
   * @description
   * Create a RelyingParty instance from a previously registered client.
   *
   * @param {Object} data
   * @returns {Promise<RelyingParty>}
   */
  static from (data) {
    let rp = new RelyingParty(data)
    let validation = rp.validate()

    // schema validation
    if (!validation.valid) {
      return Promise.reject(new Error(JSON.stringify(validation)))
    }

    let jwks = rp.provider.jwks

    // request the JWK Set if missing
    if (!jwks) {
      return rp.jwks().then(() => rp)
    }

    // otherwise import the JWK Set to webcrypto
    return JWKSet.importKeys(jwks).then(jwks => {
      rp.provider.jwks = jwks
      return rp
    })
  }

  /**
   * register
   *
   * @param issuer {string} Provider URL
   * @param registration {Object} Client dynamic registration options
   * @param options {Object}
   * @param options.defaults
   * @param [options.store] {Session|Storage}
   * @returns {Promise<RelyingParty>} RelyingParty instance, registered.
   */
  static register (issuer, registration, options) {
    let rp = new RelyingParty({
      provider: { url: issuer },
      defaults: Object.assign({}, options.defaults),
      store: options.store
    })

    return Promise.resolve()
      .then(() => rp.discover())
      .then(() => rp.jwks())
      .then(() => rp.register(registration))
      .then(() => rp)
  }

  /**
   * Discover
   *
   * @description Fetches the issuer's OpenID Configuration.
   * @returns {Promise<Object>} Resolves with the provider configuration response
   */
  discover () {
    try {
      let issuer = this.provider.url

      assert(issuer, 'RelyingParty provider must define "url"')

      let url = new URL(issuer)
      url.pathname = '.well-known/openid-configuration'

      return fetch(url.toString())
        .then(onHttpError('Error fetching openid configuration'))
        .then(response => {
          return response.json().then(json => this.provider.configuration = json)
        })

    } catch (error) {
      return Promise.reject(error)
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
  register (options) {
    try {
      let configuration = this.provider.configuration

      assert(configuration, 'OpenID Configuration is not initialized.')
      assert(configuration.registration_endpoint, 'OpenID Configuration is missing registration_endpoint.')

      let uri = configuration.registration_endpoint
      let method = 'post'
      let headers = new Headers({ 'Content-Type': 'application/json' })
      let params = this.defaults.register
      let body = JSON.stringify(Object.assign({}, params, options))

      return fetch(uri, {method, headers, body})
        .then(onHttpError('Error registering client'))
        .then(response => {
          return response.json().then(json => this.registration = json)
        })

    } catch (error) {
      return Promise.reject(error)
    }
  }

  serialize () {
    return JSON.stringify(this)
  }

  /**
   * jwks
   *
   * @description Promises the issuer's JWK Set.
   * @returns {Promise}
   */
  jwks () {
    try {
      let configuration = this.provider.configuration

      assert(configuration, 'OpenID Configuration is not initialized.')
      assert(configuration.jwks_uri, 'OpenID Configuration is missing jwks_uri.')

      let uri = configuration.jwks_uri

      return fetch(uri)
        .then(onHttpError('Error resolving provider keys'))
        .then(response => {
          return response
            .json()
            .then(json => JWKSet.importKeys(json))
            .then(jwks => this.provider.jwks = jwks)
        })

    } catch (error) {
      return Promise.reject(error)
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
  createRequest (options, session) {
    return AuthenticationRequest.create(this, options, session || this.store)
  }

  /**
   * Validate Response
   *
   * @param response {string} req.query or req.body.text
   * @param session {Session|Storage} req.session or localStorage or similar
   *
   * @returns {Promise<Session>}
   */
  validateResponse (response, session = this.store) {
    let options

    if (response.match(/^http(s?):\/\//)) {
      options = { rp: this, redirect: response, session }
    } else {
      options = { rp: this, body: response, session }
    }

    const authResponse = new AuthenticationResponse(options)

    return AuthenticationResponse.validateResponse(authResponse)
  }

  /**
   * userinfo
   *
   * @description Promises the authenticated user's claims.
   * @returns {Promise}
   */
  userinfo () {
    try {
      let configuration = this.provider.configuration

      assert(configuration, 'OpenID Configuration is not initialized.')
      assert(configuration.userinfo_endpoint, 'OpenID Configuration is missing userinfo_endpoint.')

      let uri = configuration.userinfo_endpoint
      let access_token = this.store.access_token

      assert(access_token, 'Missing access token.')

      let headers = new Headers({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${access_token}`
      })

      return fetch(uri, {headers})
        .then(onHttpError('Error fetching userinfo'))
        .then(response => response.json())

    } catch (error) {
      return Promise.reject(error)
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
  logoutRequest (options = {}) {
    const { id_token_hint, post_logout_redirect_uri, state } = options
    let configuration

    assert(this.provider, 'OpenID Configuration is not initialized')
    configuration = this.provider.configuration
    assert(configuration, 'OpenID Configuration is not initialized')

    if (!configuration.end_session_endpoint) {
      console.log(`OpenId Configuration for ` +
        `${configuration.issuer} is missing end_session_endpoint`)
      return null
    }

    if (post_logout_redirect_uri && !id_token_hint) {
      throw new Error('id_token_hint is required when using post_logout_redirect_uri')
    }

    const params = {}

    if (id_token_hint) {
      params.id_token_hint = id_token_hint
    }
    if (post_logout_redirect_uri) {
      params.post_logout_redirect_uri = post_logout_redirect_uri
    }
    if (state) {
      params.state = state
    }

    const url = new URL(configuration.end_session_endpoint)
    url.search = FormUrlEncoded.encode(params)

    return url.href
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
  logout () {
    let configuration
    try {
      assert(this.provider, 'OpenID Configuration is not initialized.')
      configuration = this.provider.configuration
      assert(configuration, 'OpenID Configuration is not initialized.')
      assert(configuration.end_session_endpoint,
        'OpenID Configuration is missing end_session_endpoint.')
    } catch (error) {
      return Promise.reject(error)
    }

    if (!configuration.end_session_endpoint) {
      this.clearSession()
      return Promise.resolve(undefined)
    }

    let uri = configuration.end_session_endpoint
    let method = 'get'

    return fetch(uri, {method, credentials: 'include'})
      .then(onHttpError('Error logging out'))
      .then(() => this.clearSession())

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

  clearSession () {
    let session = this.store

    if (!session) { return }

    delete session[SESSION_PRIVATE_KEY]
  }

  /**
   * @param uri {string} Target Resource Server URI
   * @param idToken {IDToken} ID Token to be embedded in the PoP token
   *
   * @returns {Promise<PoPToken>}
   */
  popTokenFor (uri, idToken) {
    return PoPToken.issueFor(uri, idToken)
  }
}

const SESSION_PRIVATE_KEY = 'oidc.session.privateKey'

RelyingParty.SESSION_PRIVATE_KEY = SESSION_PRIVATE_KEY

module.exports = RelyingParty
