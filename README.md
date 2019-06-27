# RDF-Easy

## easy access to linked data and RDF

More detailed documentation aimed at novices will be coming soon.

See also the working examples for [node](./examples/node-example.js) and [browser](./examples/browser-example.html).

# Overview

RDF-Easy may be used in node or the browser. It may be used with rdflib or N3,
although it doesn't matter if you even know what those are. There are only 
nine methods.
```
  createDocument  creates or replaces an RDF document from current store**
  readDocuments   loads one or more RDF documents into the current store
  updateDocument  updates an RDF document, inserting/removing selected items**
  deleteDocuments deletes one or more RDF documents

  value           queries the current store, returns a single value as string
  query           queries the current store, returns zero or more statements
  add             adds one or more statements to the current store**
  remove          removes one or more statements from the current store**

  setPrefix       associates a prefix with an ontolgoy (many are pre-loaded)
```
Statements may be expressed as named nodes, or using curly nodes, a hash
object with the key being a predfined prefix and the value being a term:
```
  {foaf:"knows"} ... {ldp:"contains"} ... {stat:"size"}
```
A special prefix "thisDoc" refers to the currently loaded document:
```
  {thisDoc:""}    // the document itself
  {thisDoc:"me"}  // the document fragment named "me"
```
Some query examples using curly nodes:
```
  name    = await rdf.value( profileUrl, {thisDoc:"me"}  , {foaf:"name"} )
  friends = await rdf.query( profileUrl, {thisDoc:"me"}  , {foaf:"knows"} )
  files   = await rdf.query( folderUrl , {thisDoc:""}    , {ldp:"contains"} )
  size    = await rdf.value( folderUrl , files[0].object , {stat:"size"} )

  AfricanWomenMusicians = await rdf.query( musiciansUrl, [
     [ null, {rdfs"type"}     , {mo:"MusicArtist"} ],
     [ null, {geo:"region"}   , "Africa"           ],
     [ null, {demog:"gender"} , "female"           ]
  ])
```
Note that the last two examples use the results of one query as input for 
other queries.

## Methods

### initialize with rdflib or N3 and an auth/fetch pacakge
```
  const RdfEasy = require('rdf-easy') 
  const rdf = new RdfEasy( SolidAuthClient, $rdf )
```
### methods
```
  rdf.setPrefixes([{myPrefix:"https://example.com/someOntology"},...])
  await rdf.load( url1, url2, ... )
  let stringValue  = await rdf.value(...)
  let arrayOfQuads = await rdf.query(...)
```
### parameters
The first parameter of the value and query methods is the URL of a 
previously loaded resource.  The next parameters are the subject, 
predicate, object, and graph of the quad you wish to search for.
The parts of the quad may be :

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
     {"https://example.com/myOntology/":"Artist"}
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

That's all for now!

copyright &copy; 2019, Jeff Zucker, may be freely used with an MIT license


