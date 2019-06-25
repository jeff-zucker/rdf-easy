"use strict"
const ns = require('solid-namespace')()

class RdfEasy {

  constructor(auth,engine) {
    this._fetch = auth.fetch
    this._engine = engine
    if( Object.keys(engine).length>30 ) this.rdflib = true
    else this.N3 = true
    if(this.N3) {
      const { DataFactory } = engine;
      const { namedNode, literal, defaultGraph, quad } = DataFactory;
      this.namedNode = namedNode
      this.literal = literal
      this.parser = new engine.Parser()
      this.store  = new engine.Store()
    }
    else {
      this.store   = engine.graph()
      this.fetcher = engine.fetcher(this.store,{fetch:auth.fetch})
      this.namedNode = this.store.sym
    }
    this.prefix = {}
  }

  setPrefix(prefix,url){
    if(prefix.contains(/(id|termType|thisDoc)/))
      throw `${prefix} is reserved, choose another prefix`
    this.prefix[prefix]=url
  }
  getPrefix(prefix){
    return this.prefix[prefix]
  }

  async query( source,s,p,o,g ){
    if(!g) g = this.namedNode(source)
    [s,p,o,g]=[s,p,o,g].map( term => {
      if(typeof term==="object" && term){
        if(term.id) return term          // already an N3 namedNode
        if(term.termType) return term    // already an rdflib namedNode
        let prefix = Object.keys(term)   // a hash to munge into a namedNode
        let value = term[prefix]
        if(prefix=="thisDoc") {
          if(value) return this.namedNode(source+"#"+value) 
          else return this.namedNode(source) 
        }
        if(ns[prefix]) return this.namedNode( ns[prefix](value) )
        if(this.prefix[prefix]) return this.namedNode( this.prefix[prefix]+value )
        return this.namedNode( prefix + value )
      }
      if(typeof term !="undefined") return this.literal(term)  // literal
      return term                                         // undefined or null
    })
    if(this.N3)
      return await this.store.getQuads(g[0],g[1],g[2],g[3])
    else 
      return await this.store.match(g[0],g[1],g[2],g[3])
  }

  async value( url, s,p,o,g ) {
    let matches = await this.query(url,s,p,o,g)
    if(matches.length===0) return ""
    matches = matches[0]
    if(typeof s==="undefined") return matches.subject.value
    if(typeof p==="undefined") return matches.predicate.value
    if(typeof o==="undefined") return matches.object.value
  }

  async load(...urls) {
    for(let u=0;u<urls.length;u++){
      let url = urls[u]
      if(this.N3) {
        const res = await this._fetch(url)
        if(!res.ok) throw res
        const string = await res.text()
        await this._load(string, url)
      }
      else {
        await this.fetcher.load(url)
      }
    }
  }

  async _load(string,url){
      let quads =  await this._parse(string,url)
      this.store.addQuads(quads)
      return (this.store)
  }

  async _parse(string,url){
    let store =[]
    const parser = new this._engine.Parser({ baseIRI: url });
    return new Promise( async(resolve)=>{
      parser.parse( string, (err, quad, prefixes) => {
        if(err) throw err
        if(quad) {
           store.push(quad)        
        }
        resolve(store)
      })
    })
  }

}
// module.exports.RdfEasy = RdfEasy  ... this means const {RE} = require('re')
module.exports = RdfEasy          // ... this means const RE = require('re')

