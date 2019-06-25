import _regeneratorRuntime from "@babel/runtime/regenerator";
import _asyncToGenerator from "@babel/runtime/helpers/asyncToGenerator";
import { Server } from './ipc';
import { originOf } from './url-util';
export function openIdpPopup(popupUri) {
  var width = 650;
  var height = 400;
  var left = window.screenX + (window.innerWidth - width) / 2;
  var top = window.screenY + (window.innerHeight - height) / 2;
  var settings = "width=".concat(width, ",height=").concat(height, ",left=").concat(left, ",top=").concat(top);
  return window.open(popupUri, 'solid-auth-client', settings);
}
export function obtainSession(store, popup, options) {
  return new Promise(function (resolve, reject) {
    var popupServer = new Server(popup, originOf(options.popupUri || ''), popupHandler(store, options, function (session) {
      popupServer.stop();
      resolve(session);
    }));
    popupServer.start();
  });
}
export function popupHandler(store, _ref, foundSessionCb) {
  var popupUri = _ref.popupUri,
      callbackUri = _ref.callbackUri;
  return (
    /*#__PURE__*/
    function () {
      var _ref2 = _asyncToGenerator(
      /*#__PURE__*/
      _regeneratorRuntime.mark(function _callee(method) {
        var _len,
            args,
            _key,
            _args = arguments;

        return _regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                for (_len = _args.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
                  args[_key - 1] = _args[_key];
                }

                _context.t0 = method;
                _context.next = _context.t0 === 'getAppOrigin' ? 4 : _context.t0 === 'storage/getItem' ? 5 : _context.t0 === 'storage/setItem' ? 6 : _context.t0 === 'storage/removeItem' ? 7 : _context.t0 === 'getLoginOptions' ? 8 : _context.t0 === 'foundSession' ? 9 : 10;
                break;

              case 4:
                return _context.abrupt("return", window.location.origin);

              case 5:
                return _context.abrupt("return", store.getItem.apply(store, args));

              case 6:
                return _context.abrupt("return", store.setItem.apply(store, args));

              case 7:
                return _context.abrupt("return", store.removeItem.apply(store, args));

              case 8:
                return _context.abrupt("return", {
                  popupUri: popupUri,
                  callbackUri: callbackUri
                });

              case 9:
                foundSessionCb.apply(void 0, args);

              case 10:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      return function (_x) {
        return _ref2.apply(this, arguments);
      };
    }()
  );
}