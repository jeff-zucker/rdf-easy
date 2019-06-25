/**
 * Dependencies
 */
const {JSONSchema} = require('@trust/json-document')

/**
 * RelyingParty Schema
 *
 * This schema initializes and verifies Relying Party client configuration.
 * RelyingParty objects can be persisted and rehydrated. By encapsulating this data in
 * it's own class, it's possible to have multiple RP configurations running
 * simultaneously.
 */
const RelyingPartySchema = new JSONSchema({
  type: 'object',
  properties: {

    /**
     * provider
     *
     * Information about the provider, including issuer URL, human readable name,
     * and any configuration or provider metadata retrieved from the OP.
     */
    provider: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        url: { type: 'string', format: 'uri' },
        // NOTE:
        // OpenID Configuration (discovery response) and JSON Web Keys Set for an
        // issuer can be cached here. However the cache should not be persisted or
        // relied upon.
        //
        configuration: {}, // .well-known/openid-configuration
        jwks: {}           // /jwks
      },
      required: ['url']
    },

    /**
     * defaults
     *
     * Default request parameters for authentication and dynamic registration requests.
     * These values can be extended or overridden via arguments to the respective
     * request methods.
     *
     * These are part of the relying party client configuration and can be serialized
     * and persisted.
     */
    defaults: {
      type: 'object',
      properties: {

        /**
         * Use Proof of Possession token semantics for the ID Token
         */
        popToken: {
          type: 'boolean',
          default: false
        },

        /**
         * Default authentication request parameters
         */
        authenticate: {
          type: 'object',
          properties: {
            redirect_uri: {
              type: 'string',
              format: 'uri'
            },
            response_type: {
              type: 'string',
              default: 'id_token token', // browser detection
              enum: [
                'code',
                'token',
                'id_token token',
                'id_token token code'
              ]
            },
            display: {
              type: 'string',
              default: 'page',
              enum: [
                'page',
                'popup'
              ]
            },
            scope: {
              type: ['string', 'array'],
              default: ['openid']
            }
          }
        },

        /**
         * Default client registration parameters
         */
        register: {}
      }
    },

    /**
     * registration
     *
     * This is the client registration response from dynamic registration. It should
     * always reflect the client configuration on the openid provider. A client access
     * token is stored here
     */
    registration: {},// ClientMetadataSchema

    /**
     * store
     */
    store: {
      type: 'object',
      default: {}
    }
  }
})

/**
 * Export
 */
module.exports = RelyingPartySchema
