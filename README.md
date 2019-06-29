# RDF-easy

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

  string  = await rdf.value ( rdfUrl, sparqlQuery   ) 
  array   = await rdf.query ( rdfUrl, sparqlQuery   ) 
  boolean = await rdf.modify( rdfurl, sparqlUpdates )       
  

  * parameters   : a URL to query and the SPARQL to query it
  * return value : an array of values you can loop through

    let files = await rdf.query( containerUrl ,
      `SELECT ?url WHERE { <thisDoc> ldp:contains ?url.}`
    )
    for(f of files){ console.log(f.url) }


  /* log all statements in any RDF resource
  */
  let statements = await rdf.query( someTurtleUrl )
  for(var s of statements){ console.log(s.subject,s.predicate,s.object) }

  /* log the name of a profile document's owner
  */
  console.log( await rdf.value( profileUrl,
    `SELECT ?name WHERE { :me foaf:name ?name. }`
  ))

  /* log the urls and sizes of all files in a container
  */
  let files = await rdf.query( containerUrl,
    `SELECT ?url ?size WHERE { <thisDoc> ldp:contains ?url. ?url stat:size ?size.}`
  )
  for(var f of files){ console.log(f.url,f.size) }
