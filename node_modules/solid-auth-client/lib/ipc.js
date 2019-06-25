"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Client = exports.Server = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

/*
  This module describes a simple IPC interface for communicating between browser windows.
  window.postMessage() is the transport interface, and a request/response interface
  is defined on top of it as follows:

  const request = {
    'solid-auth-client': {
      id: 1234,
      method: 'doSomethingPlease',
      args: [ 'one', 'two', 'three' ]
    }
  }

  const response = {
    'solid-auth-client': {
      id: 1234,
      ret: 'the_value'
    }
  }
*/
const NAMESPACE = 'solid-auth-client';
/**
 * Receives and handles remote procedure calls.
 */

class Server {
  constructor(clientWindow, clientOrigin, handle) {
    (0, _defineProperty2.default)(this, "_clientWindow", void 0);
    (0, _defineProperty2.default)(this, "_clientOrigin", void 0);
    (0, _defineProperty2.default)(this, "_handler", void 0);
    (0, _defineProperty2.default)(this, "_messageListener", void 0);
    this._clientWindow = clientWindow;
    this._clientOrigin = clientOrigin;
    this._handler = handle;

    this._messageListener = event => this._handleMessage(event);
  }

  async _handleMessage({
    data,
    origin
  }) {
    // Ensure we can post to the origin
    if (origin !== this._clientOrigin) {
      console.warn(`solid-auth-client is listening to ${this._clientOrigin} ` + `so ignored a message received from ${origin}.`);
      return;
    } // Parse the request and send it to the handler


    const req = data && data[NAMESPACE];

    if (req && req.method) {
      const _ref = req,
            id = _ref.id,
            method = _ref.method,
            args = _ref.args;
      const ret = await this._handler(method, ...args);

      this._clientWindow.postMessage({
        [NAMESPACE]: {
          id,
          ret
        }
      }, this._clientOrigin);
    }
  }

  start() {
    window.addEventListener('message', this._messageListener);
  }

  stop() {
    window.removeEventListener('message', this._messageListener);
  }

}
/**
 * Makes remote procedure calls.
 */


exports.Server = Server;

class Client {
  constructor(serverWindow, serverOrigin) {
    (0, _defineProperty2.default)(this, "_serverWindow", void 0);
    (0, _defineProperty2.default)(this, "_serverOrigin", void 0);
    this._serverWindow = serverWindow;
    this._serverOrigin = serverOrigin;
  }

  request(method, ...args) {
    // Send the request as a message to the server window
    const id = Math.random();

    this._serverWindow.postMessage({
      [NAMESPACE]: {
        id,
        method,
        args
      }
    }, this._serverOrigin); // Create a promise that resolves to the request's return value


    return new Promise((resolve, reject) => {
      // Listen for responses to the request
      window.addEventListener('message', responseListener); // Cancel if the response takes too long

      const timeout = setTimeout(() => {
        reject(new Error('Could not connect to main window.'));
        window.removeEventListener('message', responseListener);
      }, 2000); // Processes a possible response to the request

      function responseListener({
        data
      }) {
        const resp = data && data[NAMESPACE];

        if (resp && resp.id === id && resp.hasOwnProperty('ret')) {
          resolve(resp.ret);
          clearTimeout(timeout);
          window.removeEventListener('message', responseListener);
        }
      }
    });
  }

}

exports.Client = Client;