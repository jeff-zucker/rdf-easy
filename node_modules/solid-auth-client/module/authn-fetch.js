import _regeneratorRuntime from "@babel/runtime/regenerator";
import _asyncToGenerator from "@babel/runtime/helpers/asyncToGenerator";
import 'isomorphic-fetch';
import { toUrlString } from './url-util';
import { getHost, updateHostFromResponse } from './host';
import { getSession } from './session';
import { fetchWithCredentials } from './webid-oidc';
export function authnFetch(_x, _x2, _x3, _x4) {
  return _authnFetch.apply(this, arguments);
}

function _authnFetch() {
  _authnFetch = _asyncToGenerator(
  /*#__PURE__*/
  _regeneratorRuntime.mark(function _callee(storage, fetch, input, options) {
    var session, resp;
    return _regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return getSession(storage);

          case 2:
            session = _context.sent;

            if (session) {
              _context.next = 5;
              break;
            }

            return _context.abrupt("return", fetch(input, options));

          case 5:
            _context.next = 7;
            return shouldShareCredentials(storage, input);

          case 7:
            if (!_context.sent) {
              _context.next = 9;
              break;
            }

            return _context.abrupt("return", fetchWithCredentials(session, fetch, input, options));

          case 9:
            _context.next = 11;
            return fetch(input, options);

          case 11:
            resp = _context.sent;

            if (!(resp.status === 401)) {
              _context.next = 19;
              break;
            }

            _context.next = 15;
            return updateHostFromResponse(storage)(resp);

          case 15:
            _context.next = 17;
            return shouldShareCredentials(storage, input);

          case 17:
            if (!_context.sent) {
              _context.next = 19;
              break;
            }

            resp = fetchWithCredentials(session, fetch, input, options);

          case 19:
            return _context.abrupt("return", resp);

          case 20:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, this);
  }));
  return _authnFetch.apply(this, arguments);
}

function shouldShareCredentials(_x5, _x6) {
  return _shouldShareCredentials.apply(this, arguments);
}

function _shouldShareCredentials() {
  _shouldShareCredentials = _asyncToGenerator(
  /*#__PURE__*/
  _regeneratorRuntime.mark(function _callee2(storage, input) {
    var requestHost;
    return _regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.next = 2;
            return getHost(storage)(toUrlString(input));

          case 2:
            requestHost = _context2.sent;
            return _context2.abrupt("return", requestHost != null && requestHost.requiresAuth);

          case 4:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2, this);
  }));
  return _shouldShareCredentials.apply(this, arguments);
}