const auth=require('solid-auth-cli')
const RDFeasy = require('../src')
const rdf = new RDFeasy(auth)

// find all properties of all subjects in a category 

await rdf.createOrReplace( newDoc, `
    @prefix : <#>.
    :A :inCategory    "C";
       :someProperty  "D", "E";
       :otherProperty "F", "G".
    :B :inCategory    "H".
`)
let results = await rdf.query( newDoc, `
    SELECT ?subject, ?prop ?value WHERE {
        ?subject :inCategory "C".
        ?subject ?prop ?value.
    }
`)
for(var r of results){ console.log(r.subject,r.prop,r.value) }
/* END */
