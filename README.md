# RDF easy

## easy & practical access to RDF linked data from Solid pods & other sources

All of the heavy lifting is done by rdflib, but prefixes, named nodes,
fetchers, stores, and other complexities are conveniently tucked out of
sight.

There are four methods:
```
   find a single value in an RDF resource  : rdf.value()
   find multiple values in an RDF resource : rdf.query()
   create an RDF resource                  : rdf.createOrReplace()
   modify an RDF resource                  : rdf.update()
```
- **invoking & initializing**
```javascript
  const auth    = require('solid-auth-cli') // or browser equivalent
  const RDFeasy = require('rdf-easy')       // or browser equivalent

  const rdf = new RDFeasy(auth)
```
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
- **find the URLs and sizes of all files in a container**
```javascript
  let files = await rdf.query( container, `SELECT ?url ?size WHERE {
    <> ldp:contains ?url. 
    ?url stat:size ?size.
  }`)
  for(var f of files){ console.log(f.url,f.size) }
```
- **find all agents with write access to a given url**
```javascript
  // Note : linkr:acl and linkr:describedBy give a resource's Links

  let aclDoc = await rdf.value( givenUrl,`SELECT ?aclDoc WHERE { 
    <> linkr:acl ?aclDoc.
  }`)
  let agents = await rdf.query( aclDoc, `SELECT ?agentName WHERE { 
     ?auth acl:mode  acl:Write;
           acl:agent ?agentName.
  }`)
  for(var a of agents){ console.log(a.agentName) }
```
- **find trusted apps and their modes**
```javascript
  let apps = await rdf.query( profile, `SELECT ?appName ?appMode WHERE { 
     ?app acl:origin ?appName;
          acl:mode   ?appMode.
  }`)
  for(var a of apps){ console.log(a.appName,a.appMode) }
```
- **find African Women Musicans in a list of world artists**
```javascript
  let artists = await rdf.query( worldArtists, `SELECT ?name WHERE { 
     ?artist mo:origin     "Africa"; 
             schema:gender "female";
             rdf:type      mo:MusicArtist;
             rdfs:label    ?name.
  }`)
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
&copy; 2019, Jeff Zucker, may be freely distributed with an MIT license