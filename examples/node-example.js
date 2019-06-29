const auth=require('solid-auth-cli')
const SolidRdf = require('../src')
const rdf = new SolidRdf(auth)

const account      = "https://jeffz.solid.community"
const profile      = account + "/profile/card"
const container    = account + "/public/Music/"
const worldArtists = "file://"+process.cwd()+"/examples/artists.ttl"
const givenUrl     = account + "/public/"
const newDoc       = account + "/public/test/newDoc.ttl"

async function main(){

  await auth.login()  

  await rdf.createOrReplace( newDoc, `
    @prefix : <#>.
    <> :about "stuff".
  `)
  console.log( await rdf.value( newDoc,
    `SELECT ?x WHERE { <> :about ?x. }`
  ) )

  await rdf.update( newDoc, `
    DELETE DATA { <> :about "stuff". }
    INSERT DATA { <> :about "RDF". }
  `)
  console.log( await rdf.value( newDoc,
    `SELECT ?x WHERE { <> :about ?x. }`
  ) )


  // log the name of the owner of a profile document
  //
  console.log( 
    await rdf.value(profile,`SELECT ?name WHERE { :me foaf:name ?name. }`) 
  )

  // log all triples in a profile document (or any document)
  //
  let all_triples = await rdf.query( profile )
  //  for(var t of all_triples){ console.log(t.subject,t.predicate,t.object) }

  // log the urls and sizes of all files in a container
  //
  let files = await rdf.query( container, `SELECT ?url ?size WHERE { 
    <> ldp:contains ?url. 
    ?url stat:size ?size.
  }`)
  for(var f of files){ console.log(f.url,f.size) }

  // log trusted apps and their modes
  //
  let apps = await rdf.query( profile, `SELECT ?appName ?appMode WHERE { 
     ?app acl:origin ?appName. 
     ?app acl:mode ?appMode.
  }`)
  for(var a of apps){ console.log(a.appName,a.appMode) }

  // log all agents with write access to a given url
  //     note : linkr:acl and linkr:describedBy give a resource's Links
  //
  let aclDoc = await rdf.value( givenUrl,`SELECT ?aclDoc WHERE { 
    <> linkr:acl ?aclDoc.
  }`)
  let agents = await rdf.query( aclDoc, `SELECT ?agentName WHERE { 
     ?auth acl:mode acl:Write.
     ?auth acl:agent ?agentName.
  }`)
  for(var a of agents){ console.log(a.agentName) }

  // log names of African Women Musicans from a list of world artists
  //
  let artists = await rdf.query( worldArtists, `SELECT ?name WHERE { 
     ?artist mo:origin "Africa".
     ?artist schema:gender "female".
     ?artist rdfs:type mo:MusicArtist.
     ?artist rdfs:label ?name.
  }`)
  for(var a of artists){ console.log(a.name) }

}
main()
