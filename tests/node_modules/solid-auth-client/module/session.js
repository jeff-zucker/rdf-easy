import _regeneratorRuntime from "@babel/runtime/regenerator";
import _objectSpread from "@babel/runtime/helpers/objectSpread";
import _asyncToGenerator from "@babel/runtime/helpers/asyncToGenerator";
import { getData, updateStorage } from './storage';
export function getSession(_x) {
  return _getSession.apply(this, arguments);
}

function _getSession() {
  _getSession = _asyncToGenerator(
  /*#__PURE__*/
  _regeneratorRuntime.mark(function _callee2(storage) {
    var data;
    return _regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.next = 2;
            return getData(storage);

          case 2:
            data = _context2.sent;
            return _context2.abrupt("return", data.session || null);

          case 4:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2, this);
  }));
  return _getSession.apply(this, arguments);
}

export function saveSession(storage) {
  return (
    /*#__PURE__*/
    function () {
      var _ref = _asyncToGenerator(
      /*#__PURE__*/
      _regeneratorRuntime.mark(function _callee(session) {
        var data;
        return _regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.next = 2;
                return updateStorage(storage, function (data) {
                  return _objectSpread({}, data, {
                    session: session
                  });
                });

              case 2:
                data = _context.sent;
                return _context.abrupt("return", data.session);

              case 4:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      return function (_x2) {
        return _ref.apply(this, arguments);
      };
    }()
  );
}
export function clearSession(_x3) {
  return _clearSession.apply(this, arguments);
}

function _clearSession() {
  _clearSession = _asyncToGenerator(
  /*#__PURE__*/
  _regeneratorRuntime.mark(function _callee3(storage) {
    return _regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            _context3.next = 2;
            return updateStorage(storage, function (data) {
              return _objectSpread({}, data, {
                session: null
              });
            });

          case 2:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3, this);
  }));
  return _clearSession.apply(this, arguments);
}