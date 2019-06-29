# RDF-easy

## easy & practical access to RDF linked data from Solid pods & other sources

All of the heavy lifting is done by rdblib, but prefixes, named nodes,
fetchers, stores, and other complexities are conveniently back stage.

- **log the name of the owner of a profile document**
```
  console.log( 
    await rdf.value(profile,`SELECT ?name WHERE { :me foaf:name ?name. }`) 
  )
```
- **log all triples in a profile document (or any RDF document)**
```
  let all_triples = await rdf.query( profile )
  for(var t of all_triples){ console.log(t.subject,t.predicate,t.object) }
```
- **log the urls and sizes of all files in a container**
```
  let files = await rdf.query( container,
    `SELECT ?url ?size WHERE { <thisDoc> ldp:contains ?url. ?url stat:size ?size.}`
  )
  for(var f of files){ console.log(f.url,f.size) }
```
- **log all agents with write access to a given url**
```
  await auth.login()
  let agents = await rdf.query( sampleAcl, `SELECT ?agentName WHERE { 
     ?auth acl:mode acl:Write.
     ?auth acl:agent ?agentName.
  }`)
  for(var a of agents){ console.log(a.agentName) }
```
=======
## easy & practical access to RDF linked data

- **log the name of the owner of a profile document**
```
  console.log( 
    await rdf.value(profile,`SELECT ?name WHERE { :me foaf:name ?name. }`) 
  )
```
- **log all triples in a profile document (or any RDF document)**
```
  let all_triples = await rdf.query( profile )
  for(var t of all_triples){ console.log(t.subject,t.predicate,t.object) }
```
- **log the urls and sizes of all files in a container**
```
  let files = await rdf.query( container,
    `SELECT ?url ?size WHERE { <thisDoc> ldp:contains ?url. ?url stat:size ?size.}`
  )
  for(var f of files){ console.log(f.url,f.size) }
```
- **log trusted apps and their modes**
```
  let apps = await rdf.query( profile, `SELECT ?appName ?appMode WHERE { 
     ?app acl:origin ?appName. 
     ?app acl:mode ?appMode.
  }`)
  for(var a of apps){ console.log(a.appName,a.appMode) }
```
- **find African Women Musicans in a list of world artists**
```
  let artists = await rdf.query( worldArtists, `SELECT ?name WHERE { 
     ?artist mo:origin "Africa".
     ?artist schema:gender "female".
     ?artist rdfs:type mo:MusicArtist.
     ?artist rdfs:label ?name.
  }`)
  for(var a of artists){ console.log(a.name) }
```
