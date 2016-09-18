# KHK Single Sign-on Access
> _Created by Joseph Dailey_


##Purpose for Development
>With the increase in development of internal tools for the members of KHK, and the publication of these tools on our public IP, a solution for navigation and permissions needed to be created. 

---

>##**If you are looking to install the whole KHK platform please follow [this guide](https://github.com/KappaEtaKappa/khk-web).**

##Installation
```bash
$ git clone git@github.com:/KappaEtaKappa/khk-ssa.git
```

>It is important to place this repo folder adjacent to all other services that consume khk-ssa's functions. (more to be seen later)

```bash
$ npm install
```

##Running
###Development
During development you will want to run this service just like any other node project.
```bash
$ node home.js
```

However, if you are running as the public service, you will use systemd. This project, like most of our services, comes with a `cp` folder which contains a daemon that must be added to the `/etc/systemd/system` directory and then enabled and started just like any systemd service.
####**Fortunately when installed via khk-web(production mega repo) this is installed automatically via `./build.sh'**
```bash
# cp cp/khk-ssa-daemon.service /etc/systemd/system
```

>Daemon is now registered with systemd

```bash
# systemctl enable khk-ssa-daemon.service
```

>Daemon is now enable to run on boot

```bash
# systemctl start khk-ssa-daemon.service
```

>Daemon will now begin immediatly

It should be noted that in the event that the service fails to operate successfully, you may want to check the logs.
```bash
# systemctl status khk-ssa-daemon.service
```

>or

```bash
# journalctl -rl
```

To stop the service. (for development/console prints)
```bash
# systemctl stop khk-ssa-daemon.service
```

##How it works
###Web Front
Running on port `1024` as well as the subdomain `home.` you will find two navigatable pages being

*Log in page
*Home page with links to other services

###khk-access
####Access Functions
This is the real meat of the service. This local module provides a layer to access the database (sqlite). Specific details can be found the index of the module itself, but the idea is that there are several functions which provide async requests for data such as

*logging in
*logging out
*getting user information
*checking privilage

To use these functions in other service, simply require the module as so:
```node
var ssa = require("../khk-ssa/khk-access/index.js")();
```

As mentioned earlier, this is where the adjacency of this service becomes important.

#Navbar Injection
Other than these access/db manipulation functions there is one special function: `navbar`
This function is a middleware that allows any other application to utilize the common navigation bar.

Firstly
```node
app.use(ssa.navbar("Your app name"));
```
where "Your app name" is the string present in the khk-access applications table.

Secondly, you must add the dataname into your views.

EJS:

```ejs
<% navbar %>
```

Handlebars:

```hbs
{{{ navbar }}}
```
