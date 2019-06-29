# RDF-easy

## easy & practical access to RDF linked data from Solid pods & other sources

All of the heavy lifting is done by rdflib, but prefixes, named nodes,
fetchers, stores, and other complexities are conveniently back stage.

- **log the name of the owner of a profile document**
```
  console.log( 
    await rdf.value(profile,`SELECT ?name WHERE { :me foaf:name ?name. }`) 
  )
```
- **log all statements in any RDF document**
```
  let statements = await rdf.query( anyRDF )
  for(var s of statements){ console.log(s.subject,s.predicate,s.object) }
```
- **log the URLs and sizes of all files in a container**
```
  let files = await rdf.query( container, `SELECT ?url ?size WHERE {
    <thisDoc> ldp:contains ?url. 
    ?url stat:size ?size.
  }`)
  for(var f of files){ console.log(f.url,f.size) }
```
- **log all agents with write access to a given url**
```
  // Note : linkr:acl and linkr:describedBy give a resource's Links

  let aclDoc = await rdf.value( givenUrl,`SELECT ?aclDoc WHERE { 
    <thisDoc> linkr:acl ?aclDoc.
  }`)
  let agents = await rdf.query( aclDoc, `SELECT ?agentName WHERE { 
     ?auth acl:mode acl:Write.
     ?auth acl:agent ?agentName.
  }`)
  for(var a of agents){ console.log(a.agentName) }
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
- **create an RDF document** (send a Turtle string)
```
  await rdf.createOrReplace( newDoc, `
    @prefix : <#>
    <> :about "stuff".
  `)
```
- **update an RDF document**
```
  await rdf.update( newDoc, `
    DELETE DATA { <> :about "stuff". }
    INSERT DATA { <> :about "RDF". }
  `)
```
