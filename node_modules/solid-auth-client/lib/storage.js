"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getData = getData;
exports.updateStorage = updateStorage;
exports.asyncStorage = asyncStorage;
exports.ipcStorage = ipcStorage;
exports.memStorage = exports.defaultStorage = exports.NAMESPACE = void 0;

var _ipc = require("./ipc");

const NAMESPACE = 'solid-auth-client';
exports.NAMESPACE = NAMESPACE;

const defaultStorage = () => {
  try {
    if (window && window.localStorage) {
      return asyncStorage(window.localStorage);
    }
  } catch (e) {
    if (!(e instanceof ReferenceError)) {
      throw e;
    }
  }

  console.warn(`'window.localStorage' unavailable.  ` + `Creating a (not very useful) in-memory storage object as the default storage interface.`);
  return asyncStorage(memStorage());
};
/**
 * Gets the deserialized stored data
 */


exports.defaultStorage = defaultStorage;

async function getData(store) {
  let serialized;
  let data;

  try {
    serialized = await store.getItem(NAMESPACE);
    data = JSON.parse(serialized || '{}');
  } catch (e) {
    console.warn('Could not deserialize data:', serialized);
    console.error(e);
    data = {};
  }

  return data;
}
/**
 * Updates a Storage object without mutating its intermediate representation.
 */


async function updateStorage(store, update) {
  const currentData = await getData(store);
  const newData = update(currentData);
  await store.setItem(NAMESPACE, JSON.stringify(newData));
  return newData;
}
/**
 * Takes a synchronous storage interface and wraps it with an async interface.
 */


function asyncStorage(storage) {
  return {
    getItem: key => {
      return Promise.resolve(storage.getItem(key));
    },
    setItem: (key, val) => {
      return Promise.resolve(storage.setItem(key, val));
    },
    removeItem: key => {
      return Promise.resolve(storage.removeItem(key));
    }
  };
}

const memStorage = () => {
  const store = {};
  return {
    getItem: key => {
      if (typeof store[key] === 'undefined') return null;
      return store[key];
    },
    setItem: (key, val) => {
      store[key] = val;
    },
    removeItem: key => {
      delete store[key];
    }
  };
};

exports.memStorage = memStorage;

function ipcStorage(client) {
  return {
    getItem: key => client.request('storage/getItem', key),
    setItem: (key, val) => client.request('storage/setItem', key, val),
    removeItem: key => client.request('storage/removeItem', key)
  };
}