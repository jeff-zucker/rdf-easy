import _regeneratorRuntime from "@babel/runtime/regenerator";
import _asyncToGenerator from "@babel/runtime/helpers/asyncToGenerator";
import { Client } from './ipc';
export var NAMESPACE = 'solid-auth-client';
export var defaultStorage = function defaultStorage() {
  try {
    if (window && window.localStorage) {
      return asyncStorage(window.localStorage);
    }
  } catch (e) {
    if (!(e instanceof ReferenceError)) {
      throw e;
    }
  }

  console.warn("'window.localStorage' unavailable.  " + "Creating a (not very useful) in-memory storage object as the default storage interface.");
  return asyncStorage(memStorage());
};
/**
 * Gets the deserialized stored data
 */

export function getData(_x) {
  return _getData.apply(this, arguments);
}
/**
 * Updates a Storage object without mutating its intermediate representation.
 */

function _getData() {
  _getData = _asyncToGenerator(
  /*#__PURE__*/
  _regeneratorRuntime.mark(function _callee(store) {
    var serialized, data;
    return _regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.prev = 0;
            _context.next = 3;
            return store.getItem(NAMESPACE);

          case 3:
            serialized = _context.sent;
            data = JSON.parse(serialized || '{}');
            _context.next = 12;
            break;

          case 7:
            _context.prev = 7;
            _context.t0 = _context["catch"](0);
            console.warn('Could not deserialize data:', serialized);
            console.error(_context.t0);
            data = {};

          case 12:
            return _context.abrupt("return", data);

          case 13:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, this, [[0, 7]]);
  }));
  return _getData.apply(this, arguments);
}

export function updateStorage(_x2, _x3) {
  return _updateStorage.apply(this, arguments);
}
/**
 * Takes a synchronous storage interface and wraps it with an async interface.
 */

function _updateStorage() {
  _updateStorage = _asyncToGenerator(
  /*#__PURE__*/
  _regeneratorRuntime.mark(function _callee2(store, update) {
    var currentData, newData;
    return _regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.next = 2;
            return getData(store);

          case 2:
            currentData = _context2.sent;
            newData = update(currentData);
            _context2.next = 6;
            return store.setItem(NAMESPACE, JSON.stringify(newData));

          case 6:
            return _context2.abrupt("return", newData);

          case 7:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2, this);
  }));
  return _updateStorage.apply(this, arguments);
}

export function asyncStorage(storage) {
  return {
    getItem: function getItem(key) {
      return Promise.resolve(storage.getItem(key));
    },
    setItem: function setItem(key, val) {
      return Promise.resolve(storage.setItem(key, val));
    },
    removeItem: function removeItem(key) {
      return Promise.resolve(storage.removeItem(key));
    }
  };
}
export var memStorage = function memStorage() {
  var store = {};
  return {
    getItem: function getItem(key) {
      if (typeof store[key] === 'undefined') return null;
      return store[key];
    },
    setItem: function setItem(key, val) {
      store[key] = val;
    },
    removeItem: function removeItem(key) {
      delete store[key];
    }
  };
};
export function ipcStorage(client) {
  return {
    getItem: function getItem(key) {
      return client.request('storage/getItem', key);
    },
    setItem: function setItem(key, val) {
      return client.request('storage/setItem', key, val);
    },
    removeItem: function removeItem(key) {
      return client.request('storage/removeItem', key);
    }
  };
}