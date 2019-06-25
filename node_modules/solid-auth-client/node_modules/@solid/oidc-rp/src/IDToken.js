/**
 * Local dependencies
 */
const {JWT} = require('@solid/jose')
const IDTokenSchema = require('./IDTokenSchema')

/**
 * IDToken
 */
class IDToken extends JWT {

  /**
   * Schema
   */
  static get schema () {
    return IDTokenSchema
  }
}

/**
 * Export
 */
module.exports = IDToken
