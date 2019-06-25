# OpenID Connect Relying Party _(oidc-rp)_

[![standard-readme compliant](https://img.shields.io/badge/readme%20style-standard-brightgreen.svg?style=flat-square)](https://github.com/RichardLitt/standard-readme)

> OpenID Connect Relying Party for Node.js and the browser.

- [x] Dynamic Configuration and Client Registration
- [x] Authorization Code, Implicit, and Hybrid grants
- [x] Relying Party initiated logout
- [ ] Refresh grant
- [ ] Client Credentials grant
- [ ] Key rotation using JWK `kid` value
- [ ] Session management
- [ ] front- and back-channel logout
- [ ] Request parameters as JWT
- [ ] Claims request parameter
- [ ] Claims language tags
- [ ] ACDC and Proof of Possession
- [ ] OAuth 2.0 Bearer Token requests

## Table of Contents

* [Security](#security)
* [Background](#background)
* [Install](#install)
* [Usage](#usage)
  * [Node.js](#nodejs)
  * [Browser](#browser)
* [Develop](#develop)
* [API](#api)
* [Maintainers](#maintainers)
* [Contribute](#contribute)
* [MIT License](#mit-license)

## Security

...

## Background

...

## Install

```bash
$ npm install @solid/oidc-rp --save
```

## Usage

### Node.js

```
const RelyingParty = require('@solid/oidc-rp')
```

### Browser

When loaded into an HTML page via `<script src="./dist/oidc.rp.min.js"></script>`,
the library is exposed as a global var, `OIDC`.


## Develop

### Install

```bash
$ git clone git@github.com:solid/oidc-rp.git
$ cd oidc-rp
$ npm install
```

### Build

To build a Webpack-generated bundle:

```bash
npm run dist
```

### Test

```bash
$ npm test        // Node.js
$ npm run karma   // Karma (browser)
```

## API

...

## Maintainers

...

## Contribute

### Issues

* please file [issues](https://github.com/solid/oidc-rp/issues) :)
* for bug reports, include relevant details such as platform, version, relevant data, and stack traces
* be sure to check for existing issues before opening new ones
* read the documentation before asking questions
* it's strongly recommended to open an issue before hacking and submitting a PR
* we reserve the right to close an issue for excessive bikeshedding

### Pull requests

#### Policy

* we're not presently accepting *unsolicited* pull requests
* create an issue to discuss proposed features before submitting a pull request
* create an issue to propose changes of code style or introduce new tooling
* ensure your work is harmonious with the overall direction of the project
* ensure your work does not duplicate existing effort
* keep the scope compact; avoid PRs with more than one feature or fix
* code review with maintainers is required before any merging of pull requests
* new code must respect the style guide and overall architecture of the project
* be prepared to defend your work

#### Style guide

* ES6
* Standard JavaScript
* jsdocs

#### Code reviews

* required before merging PRs
* reviewers SHOULD run the code under review

### Collaborating

#### Weekly project meeting

* Thursdays from 1:00 PM to 2:00 Eastern US time at [TBD]
* Join remotely with Google Hangouts

#### Pair programming

* Required for new contributors
* Work directly with one or more members of the core development team

### Code of conduct

* @trust/oidc-rp follows the [Contributor Covenant](http://contributor-covenant.org/version/1/3/0/) Code of Conduct.

### Contributors

* Christian Smith [@christiansmith](https://github.com/christiansmith)
* Dmitri Zagidulin [@dmitrizagidulin](https://github.com/dmitrizagidulin)

## MIT License

Copyright (c) 2016 Anvil Research, Inc.
