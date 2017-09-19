# KHK Single Sign-on Access
> _by Joseph Dailey_


## Purpose
There are several services for KHK member use hosted on our public IP. This service serves as a sort of nexus for these services. It also handles user authentication and service permissions. Its final responsibility is to perfrom SAML (single sign-on) interfacing with Google Drive for Work.

---

## **If you are looking to install the whole KHK platform please follow [this guide](https://github.com/KappaEtaKappa/khk-web).**

---

## KHK-SSA Installation
```bash
$ git clone git@github.com:/KappaEtaKappa/khk-ssa.git
$ ./build.sh
```
The build script will install all core components and enalbe/start the service. This is only a few simple steps.
- Pull git updates from master
- Install or update all NPM modules
- Copy NGINX configuration files the nginx sites folder
 - Test the NGINX changes
- Copy systemd service files into the system folder
- Enable, start, and print the status of the service.

## Running the Server
### Development Mode
During development you will want to run this service just like any other node server.
```bash
$ node home.js
```

### Release (Running as Daemon)
```bash
$ systemctl start khk-ssa.service
```
This `systemd` service file is located at `./cp/khk-ssa.service` However, the local `./build` script will move this file into the correct location. 

To persist the server across reboots and to auto-restart on failure, enable the service.
```bash
$ systemctl start khk-ssa-daemon.service
```

## (Sub) Domain Resolution
This server is managed by [NGINX](https://www.nginx.com/resources/wiki/). The main NGINX configuration is [here](https://github.com/KappaEtaKappa/khk-web/blob/master/nginx/nginx.conf). (See [this guide](https://github.com/KappaEtaKappa/khk-web) for more)

## Application Database
For services to integrate with KHK-Access, each will need to register themselves via their `.application.sh` script.

### Example
```bash
#!/bin/bash
sqlite3 ../khk-ssa/khk-access/db.sqlite "INSERT INTO apps (name, privilegeRequired, subdomain, icon) values (\"Drive\", 1, \"drive\", \"fa-file-text\");"
```
### Current Privileges
- 0 Public
- KHK General
- 2 KHK Admin

---
## KHK-Access
This module is used by many other services to authenticate the user as well as limit access depending on user privileges. 

### Require the Module
```node
var access = require("../khk-ssa/khk-access/index.js")();
```

### Using khk-access
- logIn 
-- name
-- pass
-- callback
--- On successful login `token` will be returned and may be used as a browser cookie.
- getApplications
-- token
-- callback
- isLoggedIn
-- token
-- callback
- getSessionByToken
-- token
-- callback
- getPriviledgeLevel
-- token
-- callback
- canUserAccessApplication
-- token
-- subdomain
-- callback
- getUserInformation
-- token
-- callback
- logOut
-- token
-- callback

### Navbar Injection
KHK-Access provided a unified navbar. Your service must be registered in the applications database. (see .application.sh)
```node
var access = require("../khk-ssa/khk-access/index.js")();
access.use(ssa.navbar("Your app name"));
```

In EJS you can now include the navbar...
```ejs
<% navbar %>
```
In Handlebars...
```hbs
{{{ navbar }}}
```
