# RDF easy

## easy Javascript access to RDF from Solid pods & other sources

RDF-easy is a tool for both novice and advanced developers 
which provides easy access to
[RDF](https://en.wikipedia.org/wiki/Resource_Description_Framework)
data from 
[Solid]() 
pods and other sources.
It lets you create RDF with 
[Turtle](https://linkeddata.github.io/rdflib.js/Documentation/turtle-intro.html);
query and update RDF with 
[SPARQL](https://en.wikipedia.org/wiki/SPARQL)
, and process query results in 
straight-forward Javascript arrays of hashes.  Even
if you don't know much Turtle or SPARQL, it can be a useful tool for many
common tasks and is a good way to learn them.  And if you do know Turtle and
SPARQL, RDF-easy provides a simple front-end with one interface, consistent
query return format, and lets your code remain uncluttered by things like
named nodes, prefixes, stores, fetchers, updaters, etc which are all used
(thanks to [N3](https://github.com/rdfjs/N3.js)
 and [comunica](https://github.com/comunica/comunica)
) transparently in the background . 

Since RDF-easy uses the comunica query engine, it supports the full
SPARQL 1.1 specification, which differentiates it from
[rdflib](https://github.com/linkeddata/rdflib.js/).
If you need heavy lifting ,you may be better off using rdflib, but see
the see [tips for advanced users](#advanced) below.
If you prefer working with Javascript Objects and JSON-LD over Turtle
and SPARQL, you should use 
[query-ldflex](https://github.com/solid/query-ldflex) instead.


If I get feedback this package is useful, I'll create documentation
targeted to specific audiences (novices, advanced users).  For now, the
examples below should give you an idea of what RDF-easy can do.

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
- **find the URLs and sizes of the contents of a container**
```javascript
  let contents = await rdf.query( container, `
      SELECT ?url ?size WHERE {
          <> ldp:contains ?url. 
          ?url stat:size ?size.
      }
  `)
  for(var c of contents){ console.log(c.url,c.size) }
```
- **find all agents with write access to a given URL**
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
  await rdf.update( someDoc, `
      DELETE DATA { <> :about "stuff". }
      INSERT DATA { <> :about "RDF". }
  `)
```
## working with in-memory and files rather than web resources

If you are working in nodejs using solid-auth-cli, you can use file:// URLs
to access local files the same way you would with remote files.  You can also
use app://ls URLs to work entirely in-memory localStorage, e.g. create a 
Turtle resource and query it without writing anything to disk.

## <a name="advanced">Tips for advanced users</a>

### quads

Everything shown above with triples can be used with quads, I just didn't
mention that, so as not to confuse beginners.

### additional namespaces

Many of the common namespaces (foaf,ldp,etc.) are included by default and
you do not need to define them in your queries.  If you have a custom 
namespace, either add it to the SPARQL with a standard PREFIX declaration,
or use &lt;full-url-of-namespace-and-term&gt; in your SPARQL.

### re-querying the same source

If you want to run additional queries on a data URL you have
already loaded, you can pass null as the data URL which will
reuse the store from the previous query or value.
```javascript
  let results1 = await rdf.query( dataUrl, sparql1 )
  let results2 = await rdf.query( null, sparql2 )
```

### querying multiple sources at once

Instead of passing a single URL to the query method, you
may pass an array of URLs all of which will be added to the store.
The query will be run against all the sources.
```javascript
  let results = await rdf.query( [url1,url2,...], sparql )
```
&copy; 2019, Jeff Zucker, may be freely distributed with an MIT license