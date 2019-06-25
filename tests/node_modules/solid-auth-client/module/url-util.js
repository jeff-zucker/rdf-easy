/* eslint-env browser */
export var currentUrl = function currentUrl() {
  return window.location.href;
};
export var currentUrlNoParams = function currentUrlNoParams() {
  return window.location.origin + window.location.pathname;
};
export var navigateTo = function navigateTo(url) {
  window.location.href = url;
};
export var originOf = function originOf(url) {
  return new URL(url).origin;
};
export var toUrlString = function toUrlString(url) {
  if (typeof url !== 'string') {
    url = 'url' in url ? url.url : url.toString();
  }

  return new URL(url, currentUrl()).toString();
};