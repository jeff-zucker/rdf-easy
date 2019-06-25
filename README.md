# RDF-Easy

## easy access to linked data and RDF

Documentation for novices coming soon, here's a quick usage summary to start

### initialize with rdflib
```
  const RdfEasy = require('rdf-easy')
  const rdf = new RdfEasy( require('rdflib') )  
```
### or intitalize with N3 and a fetcher
```
  const RdfEasy = require('rdf-easy')
  const rdf = new RdfEasy( require('N3'), require('solid-auth-cli') )  
```
### declare prefixes if needed (most are included transparently)
```
  rdf.setPrefixes(["myPrefix","https://example.com/someOntology",...])
```
### load one or more RDF resources
```
  await rdf.load( url1, url2, ... )
```
### use query methods
```
  let stringValue  = rdf.value(...)
  let arrayOfQuads = rdf.query(...)
```
The first parameter of query methods is the URL of a previously loaded 
resource.  The next parameters are the subject, predicate, object,
and graph of the quad you wish to search for.  The parts of the quad
may be :

  * null or undefined to indicate a wildcard
  * a namedNode 
  * a literal (only for the object)
  * a Curly Node (see below)

### Curly Nodes

A curly node, is a non-standard way to represent namedNodes without having
to explicitly call $rdf.sym or N3.namedNode on them. It is an associative
array with the key being a string that references a defined prefix and the
value being a term.  For example:
```
  { foaf:"knows" }
```
### Prefixes
Pefixes are always strings although they can be used without quotes because 
of the way hashes work.  These are valid prefixes:

  * any prefix defined by the solid-namespace package

  * any prefix defined by the user with the setPrefix() method

  * thisDoc to indicate the current resource
```
     {thisDoc:""}   the resource itself
     {thisDoc:"me"} the fragment in the resource labeld "me"
```
  * a string giving an absolute URL
```
     {"https://example.com/myOntology":"Artist"}
```
### Display the results

The rdf.value() method returns a string, while rdf.query() returns an
array of quads.  You can loop through the quads 
```
  let files = await rdf.query( folderUrl, {thisDoc:""}, {ldp:"contains"} )
  for(f in files){
    console.log( files[f].object.value )
  }
```
You can also use the returned quads as imput for another query:
```
  let files = await rdf.query( folderUrl, {thisDoc:""}, {ldp:"contains"} )
  for(f in files){
    console.log( rdf.value(folderUrl,files[f].object,{stat:"size"}) )
  }
```

copyright &copy; 2019, Jeff Zucker, may be freely used with an MIT license


