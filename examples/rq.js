const RdfEasy = require('../')
const rdf = new RdfEasy( require('solid-auth-cli'), require('rdflib') )

const profileUrl = "https://jeffz.solid.community/profile/card"
const storageUrl = "https://jeffz.solid.community/public/Music/"

async function main(){
  await rdf.load( profileUrl, storageUrl )
  let name    = await rdf.value( profileUrl, {thisDoc:"me"} ,{foaf:"name"} )
  let friends = await rdf.query( profileUrl, {thisDoc:"me"} ,{foaf:"knows"} )
  let files   = await rdf.query( storageUrl, {thisDoc:""}   ,{ldp:"contains"} )
  let size    = await rdf.value( storageUrl, files[0].object,{stat:"size"} )
  // or, for example
  // rdf.setPrefix("mo","http://purl.org/ontology/mo/") ... {mo:"MusicArtist"} 
  // or just {"http://purl.org/ontology/mo/":"MusicArtist"} 
  display(name,friends,files,size)
}

async function display(name,friends,files,size){
  for(var f in friends){ 
    let friendsName=await rdf.value(profileUrl,friends[f].object,{foaf:"name"})
    console.log(`${name} knows ${friendsName}`)
  }
  for(var f in files) {
    console.log(`storage includes <${files[f].object.value}>`)
  }
  console.log(`The first storage item is ${size} bytes long.`)
}
main()

/* OUTPUT IS :

Jeff Zucker knows Ib Mubarak
Jeff Zucker knows Tyler Spades
storage includes <https://jeffz.solid.community/public/Music/Ambient/>
storage includes <https://jeffz.solid.community/public/Music/db/>
storage includes <https://jeffz.solid.community/public/Music/playlists.ttl>
The first storage item is 4096 bytes long.

*/
