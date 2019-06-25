const auth     = require('solid-auth-cli')
const RdfQuery = require('../')
const rdf      = new RdfQuery(auth)

const root     = "https://jeffz.solid.community/public/Music/"
async function main(){
  let session = await auth.login()
  console.log("logged in as <"+session.webId+">")
  let folder = await processFolder(root)
  if(folder) console.log(folder)
}

async function processFolder(folderUrl) {
  let files  = await rdf.query( folderUrl, {thisDoc:""}, {ldp:"contains"} )
  let folder = await getLinks(folderUrl)
  folder[0] = Object.assign( folder[0], 
    processStatements( await rdf.query(null,{thisDoc:""})  )
  )
  if(files.length===0 && folder.length===1) {
    console.log("folder is empty"); 
    return 
  }
  let folderItems = []
  let fileItems   = []
  for(f in files){
    let thisFile = files[f].object
    let thisFileWithLinks = await getLinks(thisFile.value) 
    thisFileWithLinks[0] = Object.assign( thisFileWithLinks[0], 
      processStatements( await rdf.query(null,thisFile )  )
    )
    if( thisFileWithLinks[0].type === "Container" ) {
      folderItems = folderItems.concat( thisFileWithLinks )
    }
    else
      fileItems = fileItems.concat( thisFileWithLinks )
  }
  const fullName = folderUrl.replace(/\/$/, '');
  const name = fullName.replace(/.*\//, '');
  const parent = fullName.substr(0, fullName.lastIndexOf("/"))+"/";
  returnVal = folder.shift()            // the container itself
  fileItems = fileItems.concat(folder)  // the .acl etc of the container itself
  returnVal.type    = "folder",         // for backwards compatability :-(
  returnVal.name    = name,
  returnVal.parent  = parent,
  returnVal.url     = folderUrl,
  returnVal.folders = folderItems,
  returnVal.files   = fileItems
  // returnVal.content,                 // thinking of not sending the turtle
  return returnVal
  function processStatements(stmts){
    let returnVal = {}
    stmts.forEach( stm => {
      let predicate = stm.predicate.value.replace(/.*\//,'').replace(/.*#/,'')
      if(!predicate.endsWith("type") && !predicate.match("contains"))
        returnVal[predicate] = stm.object.value
    })
    return returnVal
  }
}

async function deleteContainer(folderUrl){
  deleteFolderContents(folderUrl)
    .then( auth.fetch(folderUrl,{method:"DELETE"} )
    .catch( e=>console.log )
  )
}

/* Deletes folder contents AND folder
*/
async function deleteFolderContents(folderUrl){
  let files = await getContainer( folderUrl )
  if(typeof files !="object") return
  let start = files.length
  console.log(`deleting ${start} files from ${folderUrl}`)
  files.forEach( async(file) => {
    console.log(" >>",file.url)    
    let delRes = await auth.fetch(file.url,{method:"DELETE"})
    if(!delRes.ok) { console.log(delRes.status) }
  })
  let newfiles = await getContainer( folderUrl )
  newfiles = newfiles || []
  console.log(`deleted ${start-newfiles.length} files from ${folderUrl}`)
}

  /**
   * getLinks(itemUrl)
   *
   * returns an array of records related to an item (resource or container)
   *   0   : the item itself
   *   1-3 : the .acl, .meta, and .meta.acl for the item if they exist
   * each record includes these fields
   *   url
   *   type (one of Container, Resource, AccessControl, or Metadata)
   *   content-type (text/turtle, etc.)
   */
  async function getLinks(url){
    let res  = await auth.fetch(url,{method:"HEAD"})
    let link = await res.headers.get("link")
    link     = await parseLinkHeader(link,url,url)
    let item = []
    item.push({ 
        url:url, 
        type:link.type,
        "content-type":  res.headers.get("content-type"),
    })
    if(link.acl) item.push( link.acl )
    if(link.meta) item.push( link.meta )
    if(link.metaAcl) item.push( link.metaAcl )
    return item

  // I Stole this from rdflib and munged it
  async  function parseLinkHeader (linkHeader, originalUri, reqNode) {
    if (!linkHeader) { return }

    // const linkexp = /<[^>]*>\s*(\s*;\s*[^()<>@,;:"/[\]?={} \t]+=(([^()<>@,;:"/[]?={} \t]+)|("[^"]*")))*(,|$)/g
    // const paramexp = /[^()<>@,;:"/[]?={} \t]+=(([^()<>@,;:"/[]?={} \t]+)|("[^"]*"))/g

    // From https://www.dcode.fr/regular-expression-simplificator:
    // const linkexp = /<[^>]*>\s*(\s*;\s*[^()<>@,;:"/[\]?={} t]+=["]))*[,$]/g
    // const paramexp = /[^\\<>@,;:"\/\[\]?={} \t]+=["])/g
    // Original:
    const linkexp = /<[^>]*>\s*(\s*;\s*[^()<>@,;:"/[\]?={} \t]+=(([^\(\)<>@,;:"\/\[\]\?={} \t]+)|("[^"]*")))*(,|$)/g
    const paramexp = /[^\(\)<>@,;:"\/\[\]\?={} \t]+=(([^\(\)<>@,;:"\/\[\]\?={} \t]+)|("[^"]*"))/g

    const matches = linkHeader.match(linkexp)
    let final = {}
    for (let i = 0; i < matches.length; i++) {
      let split = matches[i].split('>')
      let href = split[0].substring(1)
      if(matches[i].match(/rel="acl"/)){
        let acl= urlJoin(href,originalUri)
        let aclres= await auth.fetch(acl,{method:"HEAD"})
        if(aclres.ok){
          final.acl= {
            "url":acl,
             type:"AccessControl",
            "content-type": aclres.headers.get("content-type"),
          }
        }
      }
      if(matches[i].match(/rel="describedBy"/)){
        let meta= urlJoin(href,originalUri)
        let metares=await auth.fetch(meta,{method:"HEAD"})
        if(metares.ok){
          final.meta= {
            "url":meta,
            type:"Metadata",
            "content-type": metares.headers.get("content-type"),
          }
        }
        if(final.meta){
          let m = await getLinks(final.meta.url)
          if( m.acl ) final.metaAcl = m.acl
        }
      }
      if(matches[i].match(/rel="type"/)) final.type = href.match("Resource")
        ? "Resource" : "Container"
    }
    return final
  function urlJoin (given, base) {
    var baseColon, baseScheme, baseSingle
  var colon, lastSlash, path
  var baseHash = base.indexOf('#')
  if (baseHash > 0) {
    base = base.slice(0, baseHash)
  }
  if (given.length === 0) {
    return base
  }
  if (given.indexOf('#') === 0) {
    return base + given
  }
  colon = given.indexOf(':')
  if (colon >= 0) {
    return given
  }
  baseColon = base.indexOf(':')
  if (base.length === 0) {
    return given
  }
  if (baseColon < 0) {
    alert('Invalid base: ' + base + ' in join with given: ' + given)
    return given
  }
  baseScheme = base.slice(0, +baseColon + 1 || 9e9)
  if (given.indexOf('//') === 0) {
    return baseScheme + given
  }
  if (base.indexOf('//', baseColon) === baseColon + 1) {
    baseSingle = base.indexOf('/', baseColon + 3)
    if (baseSingle < 0) {
      if (base.length - baseColon - 3 > 0) {
        return base + '/' + given
      } else {
        return baseScheme + given
      }
    }
  } else {
    baseSingle = base.indexOf('/', baseColon + 1)
    if (baseSingle < 0) {
      if (base.length - baseColon - 1 > 0) {
        return base + '/' + given
      } else {
        return baseScheme + given
      }
    }
  }
  if (given.indexOf('/') === 0) {
    return base.slice(0, baseSingle) + given
  }
  path = base.slice(baseSingle)
  lastSlash = path.lastIndexOf('/')
  if (lastSlash < 0) {
    return baseScheme + given
  }
  if (lastSlash >= 0 && lastSlash < path.length - 1) {
    path = path.slice(0, +lastSlash + 1 || 9e9)
  }
  path += given
  while (path.match(/[^\/]*\/\.\.\//)) {
    path = path.replace(/[^\/]*\/\.\.\//, '')
  }
  path = path.replace(/\.\//g, '')
  path = path.replace(/\/\.$/, '/')
  return base.slice(0, baseSingle) + path

    } // end of urlJoin
  }   // end of parseLinkHeader
}     // end of getLinks

main()

/* END 
*/


