module.exports=function(t){var e={};function r(n){if(e[n])return e[n].exports;var o=e[n]={i:n,l:!1,exports:{}};return t[n].call(o.exports,o,o.exports,r),o.l=!0,o.exports}return r.m=t,r.c=e,r.d=function(t,e,n){r.o(t,e)||Object.defineProperty(t,e,{enumerable:!0,get:n})},r.r=function(t){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},r.t=function(t,e){if(1&e&&(t=r(t)),8&e)return t;if(4&e&&"object"==typeof t&&t&&t.__esModule)return t;var n=Object.create(null);if(r.r(n),Object.defineProperty(n,"default",{enumerable:!0,value:t}),2&e&&"string"!=typeof t)for(var o in t)r.d(n,o,function(e){return t[e]}.bind(null,o));return n},r.n=function(t){var e=t&&t.__esModule?function(){return t.default}:function(){return t};return r.d(e,"a",e),e},r.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},r.p="",r(r.s=1)}([function(t,e,r){"undefined"==typeof window&&($rdf=r(3));t.exports=class{constructor(t){this._prefixStr=this._getPrefixes(),this._auth=t}async _multiQuery(t,e){for(var r of(this.store=$rdf.graph(),this.fetcher=$rdf.fetcher(this.store,{fetch:this._auth.fetch}),t))await this.fetcher.load(r);return await this.query(null,e)}async query(t,e){return e=this._prepSparql(t,e),Array.isArray(t)?await this._multiQuery(t,e):await this._runQuery(t,e,"array")}async value(t,e){return e=this._prepSparql(t,e),await this._runQuery(t,e,"value")}async _runQuery(t,e,r){t&&await this._load(t);let n=await this._execute(e);if(r.match(/array/i))return n;if(r.match(/value/i)){if(!n||n.length<1)return"";let t=Object.keys(n[0])[0];return n[0][t]}}async _execute(t){let e=this;return new Promise(async(r,n)=>{let o=$rdf.SPARQLToQuery(t,!1,e.store),a=o.vars,i=[];e.store.query(o,async t=>{void 0===t&&n("No results.");let e=await this._rowHandler(a,t);e&&i.push(e)},{},function(){return r(i)})})}async _rowHandler(t,e){let r={};for(var n in e){let a=!1,i=n.replace(/^\?/,"");if(t.length){for(var o in t)i!==t[o].label||(a=!0);if(!a)continue}r[i]=e[n].value}return r}_prepSparql(t,e){return e||(e="SELECT * WHERE {?subject ?predicate ?object.}"),e=e.replace(/\<\>/,"<"+t+">"),e=`PREFIX : <${t}#>\n`+this._prefixStr+e}async _load(t){this.store=$rdf.graph(),this.fetcher=$rdf.fetcher(this.store,{fetch:this._auth.fetch}),await this.fetcher.load(t)}async createOrReplace(t,e,r="text/turtle"){try{await this._auth.fetch(t,{method:"PUT",body:e,headers:{"Content-Type":r}})}catch(t){throw t}}async update(t,e){try{return await this._auth.fetch(t,{method:"PATCH",headers:{"Content-Type":"application/sparql-update"},body:e})}catch(t){throw t}}_getPrefixes(){let t={acl:"http://www.w3.org/ns/auth/acl#",arg:"http://www.w3.org/ns/pim/arg#",cal:"http://www.w3.org/2002/12/cal/ical#",contact:"http://www.w3.org/2000/10/swap/pim/contact#",dc:"http://purl.org/dc/elements/1.1/",dct:"http://purl.org/dc/terms/",doap:"http://usefulinc.com/ns/doap#",foaf:"http://xmlns.com/foaf/0.1/",http:"http://www.w3.org/2007/ont/http#",httph:"http://www.w3.org/2007/ont/httph#",icalTZ:"http://www.w3.org/2002/12/cal/icaltzd#",ldp:"http://www.w3.org/ns/ldp#",link:"http://www.w3.org/2007/ont/link#",linkr:"http://www.iana.org/assignments/link-relations/",log:"http://www.w3.org/2000/10/swap/log#",media:"http://www.iana.org/assignments/media-types/",meeting:"http://www.w3.org/ns/pim/meeting#",mo:"http://purl.org/ontology/mo/",owl:"http://www.w3.org/2002/07/owl#",pad:"http://www.w3.org/ns/pim/pad#",patch:"http://www.w3.org/ns/pim/patch#",qu:"http://www.w3.org/2000/10/swap/pim/qif#",trip:"http://www.w3.org/ns/pim/trip#",rdf:"http://www.w3.org/1999/02/22-rdf-syntax-ns#",rdfs:"http://www.w3.org/2000/01/rdf-schema#",rss:"http://purl.org/rss/1.0/",sched:"http://www.w3.org/ns/pim/schedule#",schema:"http://schema.org/",sioc:"http://rdfs.org/sioc/ns#",solid:"http://www.w3.org/ns/solid/terms#",space:"http://www.w3.org/ns/pim/space#",stat:"http://www.w3.org/ns/posix/stat#",tab:"http://www.w3.org/2007/ont/link#",tabont:"http://www.w3.org/2007/ont/link#",ui:"http://www.w3.org/ns/ui#",vcard:"http://www.w3.org/2006/vcard/ns#",wf:"http://www.w3.org/2005/01/wf/flow#",xsd:"http://www.w3.org/2001/XMLSchema#"},e="";for(var r in t)e+=`PREFIX ${r}: <${t[r]}>\n`;return e}}},function(t,e,r){"use strict";r.r(e),function(t){var n=r(0),o=r.n(n);"undefined"==typeof window&&(t.exports=o.a),e.default=o.a}.call(this,r(2)(t))},function(t,e){t.exports=function(t){if(!t.webpackPolyfill){var e=Object.create(t);e.children||(e.children=[]),Object.defineProperty(e,"loaded",{enumerable:!0,get:function(){return e.l}}),Object.defineProperty(e,"id",{enumerable:!0,get:function(){return e.i}}),Object.defineProperty(e,"exports",{enumerable:!0}),e.webpackPolyfill=1}return e}},function(t,e){t.exports=require("rdflib")}]).default;
//# sourceMappingURL=rdf-easy.bundle.js.map