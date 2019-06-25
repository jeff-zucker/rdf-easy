import _regeneratorRuntime from "@babel/runtime/regenerator";
import _toConsumableArray from "@babel/runtime/helpers/toConsumableArray";
import _asyncToGenerator from "@babel/runtime/helpers/asyncToGenerator";
import _classCallCheck from "@babel/runtime/helpers/classCallCheck";
import _createClass from "@babel/runtime/helpers/createClass";
import _defineProperty from "@babel/runtime/helpers/defineProperty";

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
var NAMESPACE = 'solid-auth-client';
/**
 * Receives and handles remote procedure calls.
 */

export var Server =
/*#__PURE__*/
function () {
  function Server(clientWindow, clientOrigin, handle) {
    var _this = this;

    _classCallCheck(this, Server);

    _defineProperty(this, "_clientWindow", void 0);

    _defineProperty(this, "_clientOrigin", void 0);

    _defineProperty(this, "_handler", void 0);

    _defineProperty(this, "_messageListener", void 0);

    this._clientWindow = clientWindow;
    this._clientOrigin = clientOrigin;
    this._handler = handle;

    this._messageListener = function (event) {
      return _this._handleMessage(event);
    };
  }

  _createClass(Server, [{
    key: "_handleMessage",
    value: function () {
      var _handleMessage2 = _asyncToGenerator(
      /*#__PURE__*/
      _regeneratorRuntime.mark(function _callee(_ref) {
        var data, origin, req, _ref2, id, method, _args, ret;

        return _regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                data = _ref.data, origin = _ref.origin;

                if (!(origin !== this._clientOrigin)) {
                  _context.next = 4;
                  break;
                }

                console.warn("solid-auth-client is listening to ".concat(this._clientOrigin, " ") + "so ignored a message received from ".concat(origin, "."));
                return _context.abrupt("return");

              case 4:
                // Parse the request and send it to the handler
                req = data && data[NAMESPACE];

                if (!(req && req.method)) {
                  _context.next = 11;
                  break;
                }

                _ref2 = req, id = _ref2.id, method = _ref2.method, _args = _ref2.args;
                _context.next = 9;
                return this._handler.apply(this, [method].concat(_toConsumableArray(_args)));

              case 9:
                ret = _context.sent;

                this._clientWindow.postMessage(_defineProperty({}, NAMESPACE, {
                  id: id,
                  ret: ret
                }), this._clientOrigin);

              case 11:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      return function _handleMessage(_x) {
        return _handleMessage2.apply(this, arguments);
      };
    }()
  }, {
    key: "start",
    value: function start() {
      window.addEventListener('message', this._messageListener);
    }
  }, {
    key: "stop",
    value: function stop() {
      window.removeEventListener('message', this._messageListener);
    }
  }]);

  return Server;
}();
/**
 * Makes remote procedure calls.
 */

export var Client =
/*#__PURE__*/
function () {
  function Client(serverWindow, serverOrigin) {
    _classCallCheck(this, Client);

    _defineProperty(this, "_serverWindow", void 0);

    _defineProperty(this, "_serverOrigin", void 0);

    this._serverWindow = serverWindow;
    this._serverOrigin = serverOrigin;
  }

  _createClass(Client, [{
    key: "request",
    value: function request(method) {
      for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }

      // Send the request as a message to the server window
      var id = Math.random();

      this._serverWindow.postMessage(_defineProperty({}, NAMESPACE, {
        id: id,
        method: method,
        args: args
      }), this._serverOrigin); // Create a promise that resolves to the request's return value


      return new Promise(function (resolve, reject) {
        // Listen for responses to the request
        window.addEventListener('message', responseListener); // Cancel if the response takes too long

        var timeout = setTimeout(function () {
          reject(new Error('Could not connect to main window.'));
          window.removeEventListener('message', responseListener);
        }, 2000); // Processes a possible response to the request

        function responseListener(_ref3) {
          var data = _ref3.data;
          var resp = data && data[NAMESPACE];

          if (resp && resp.id === id && resp.hasOwnProperty('ret')) {
            resolve(resp.ret);
            clearTimeout(timeout);
            window.removeEventListener('message', responseListener);
          }
        }
      });
    }
  }]);

  return Client;
}();