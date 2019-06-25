const auth     = require('solid-auth-cli')
const RdfQuery = require('../')
const rdf      = new RdfQuery(auth)

const profileUrl = "https://jeffz.solid.community/profile/card" 
const folderUrl  = "https://jeffz.solid.community/public/Music/" 

async function main(){
  let name  = await rdf.query( profileUrl, {thisDoc:"me"}, {foaf:"name"} )
  let files = await rdf.query( folderUrl , {thisDoc:""}  , {ldp:"contains"} )
  console.log( `${name} has examined a folder which contains`)
  files.forEach( async(file) => {
    let size = await rdf.query( null, file.object, {stat:"size"}  )
    console.log( "   ", file.object.value, size, " bytes" )
  })
}
main()

/* END 

    let type = rdf.holds(thisFile,"type","BasicContainer") 
             ? "Container" 
             : "Resource"

*/



