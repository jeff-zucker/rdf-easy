# RDF easy

## easy & practical access to RDF linked data from Solid pods & other sources

Here's how it works :  You create, modify, and query RDF resources using 
Turtle and SPARQL and get back either a single value or a straightforward 
Javascript array of hashes.  You don't need to know much about Turtle and 
SPARQL for it to be useful for many common tasks. And if you do know them, 
there are many possibilities.  

Under the hood, is the ever-magnificent [rdflib](https://github.com/linkeddata/rdflib.js/). The goal here is to be less
daunting than rdflib and closer to the RDF bone (for the user) than 
[query-ldflex](https://github.com/solid/query-ldflex).  If you need really heavy lifting, use rdflib instead or in addition (see [tips for advanced users](#advanced) below).  If you prefer Javascript objects to SPARQL, use query-ldflex instead.

## Methods (<i>there are only four</i>):
```
    find a single value in an RDF resource : rdf.value()
   find multiple values in an RDF resource : rdf.query()
                    create an RDF resource : rdf.createOrReplace()
                    modify an RDF resource : rdf.update()
```
## Invoking & initializing
```javascript
  const auth    = require('solid-auth-cli') // or browser equivalent
  const RDFeasy = require('rdf-easy')       // or browser equivalent

  const rdf = new RDFeasy(auth)
```
## Some examples
- **find the name of the owner of a profile document**
```javascript
  console.log( 
    await rdf.value(profile,`SELECT ?name WHERE { :me foaf:name ?name. }`) 
  )
```
- **find all statements in any RDF document**
```javascript
  let statements = await rdf.query( anyRDF )
  for(var s of statements){ console.log(s.subject,s.predicate,s.object) }
```
- **find everything about a given subject in an RDF document**
```javascript
  let about = await rdf.query( anyRDF, `
      SELECT ?property ?value WHERE { :anySubject ?property ?value. }
  `)
  for(var a of about){ console.log(a.property,a.value) }
```
- **find the URLs and sizes of all files in a container**
```javascript
  let files = await rdf.query( container, `
      SELECT ?url ?size WHERE {
          <> ldp:contains ?url. 
          ?url stat:size ?size.
      }
  `)
  for(var f of files){ console.log(f.url,f.size) }
```
- **find all agents with write access to a given url**
```javascript
  // Note : the link header of a document becomes part of its results
  // using the IANA link-relations vocabulary (prefix linkr).
  // Links can be retrieved by querying for linkr:acl and linkr:describedBy
  //
  let aclDoc = await rdf.value( givenUrl,`
      SELECT ?aclDoc WHERE { <> linkr:acl ?aclDoc. }
  `)
  let agents = await rdf.query( aclDoc, `
      SELECT ?agentName WHERE { 
          ?auth acl:mode  acl:Write;
                acl:agent ?agentName.
      }
  `)
  for(var a of agents){ console.log(a.agentName) }
```
- **find trusted apps and their modes**
```javascript
  let apps = await rdf.query( profile, `
      SELECT ?appName ?appMode WHERE { 
          ?app acl:origin ?appName;
               acl:mode   ?appMode.
      }
  `)
  for(var a of apps){ console.log(a.appName,a.appMode) }
```
- **find African Women Musicans in a list of world artists**
```javascript
  let artists = await rdf.query( worldArtists, `
      SELECT ?name WHERE { 
          ?artist mo:origin     "Africa"; 
                  schema:gender "female";
                  rdf:type      mo:MusicArtist;
                  rdfs:label    ?name.
      }
  `)
  for(var a of artists){ console.log(a.name) }
```
- **create an RDF document** (send a Turtle string)
```javascript
  await rdf.createOrReplace( newDoc, `
      @prefix : <#>
      <> :about "stuff".
  `)
```
- **update an RDF document**
```javascript
  await rdf.update( newDoc, `
      DELETE DATA { <> :about "stuff". }
      INSERT DATA { <> :about "RDF". }
  `)
```
## <a name="advanced">Tips for advanced users</a>

### quads

Everything shown above with triples can be used with quads, I just didn't
mention that, so as not to confuse beginners.

### additional namespaces

Many of the common namespaces (foaf,ldp,etc.) are included by default and
you do not need to define them in your queries.  If you have a custom 
namespace, either add it to the SPARQL with a standard PREFIX declaration,
or use &lt;full-url-of-namespace-and-term&gt; in your SPARQL.

### working with RDF formats other than Turtle

If you wish to create resources in n3, RDF/XML, etc. you may pass a
content-type tag as the third parameter of createOrReplace()

### querying multiple sources at once

Instead of passing a single URL to the query and value methods, you
may pass an array of URLs all of which will be added to the store.

### reusing the store

The rdflib store object is used behind the scenes, but if you need it
or its methods, you can access it with rdf.store.  It will be loaded
with whatever you requested in your last value() or query() call.

&copy; 2019, Jeff Zucker, may be freely distributed with an MIT license