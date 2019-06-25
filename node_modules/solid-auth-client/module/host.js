import _defineProperty from "@babel/runtime/helpers/defineProperty";
import _objectSpread from "@babel/runtime/helpers/objectSpread";
import _regeneratorRuntime from "@babel/runtime/regenerator";
import _asyncToGenerator from "@babel/runtime/helpers/asyncToGenerator";

/* globalRequest, Response, URL */
import { getSession } from './session';
import { getData, updateStorage } from './storage';
import * as WebIdOidc from './webid-oidc';
export function getHost(storage) {
  return (
    /*#__PURE__*/
    function () {
      var _ref = _asyncToGenerator(
      /*#__PURE__*/
      _regeneratorRuntime.mark(function _callee(url) {
        var _ref2, host, session, _ref3, hosts;

        return _regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _ref2 = new URL(url), host = _ref2.host;
                _context.next = 3;
                return getSession(storage);

              case 3:
                session = _context.sent;

                if (!(session && host === new URL(session.idp).host)) {
                  _context.next = 6;
                  break;
                }

                return _context.abrupt("return", {
                  url: host,
                  requiresAuth: true
                });

              case 6:
                _context.next = 8;
                return getData(storage);

              case 8:
                _ref3 = _context.sent;
                hosts = _ref3.hosts;
                return _context.abrupt("return", hosts && hosts[host]);

              case 11:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      return function (_x) {
        return _ref.apply(this, arguments);
      };
    }()
  );
}
export function saveHost(storage) {
  return (
    /*#__PURE__*/
    function () {
      var _ref5 = _asyncToGenerator(
      /*#__PURE__*/
      _regeneratorRuntime.mark(function _callee2(_ref4) {
        var url, requiresAuth;
        return _regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                url = _ref4.url, requiresAuth = _ref4.requiresAuth;
                _context2.next = 3;
                return updateStorage(storage, function (data) {
                  return _objectSpread({}, data, {
                    hosts: _objectSpread({}, data.hosts, _defineProperty({}, url, {
                      requiresAuth: requiresAuth
                    }))
                  });
                });

              case 3:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      return function (_x2) {
        return _ref5.apply(this, arguments);
      };
    }()
  );
}
export function updateHostFromResponse(storage) {
  return (
    /*#__PURE__*/
    function () {
      var _ref6 = _asyncToGenerator(
      /*#__PURE__*/
      _regeneratorRuntime.mark(function _callee3(resp) {
        var _ref7, host;

        return _regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                if (!WebIdOidc.requiresAuth(resp)) {
                  _context3.next = 4;
                  break;
                }

                _ref7 = new URL(resp.url), host = _ref7.host;
                _context3.next = 4;
                return saveHost(storage)({
                  url: host,
                  requiresAuth: true
                });

              case 4:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      return function (_x3) {
        return _ref6.apply(this, arguments);
      };
    }()
  );
}