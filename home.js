var ssa = require(__dirname + '/khk-access')();

var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var delta = express();

// view engine setup
delta.set('views', path.join(__dirname, 'views'));
delta.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//delta.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
delta.use(logger('dev'));
delta.use(bodyParser.json());
delta.use(bodyParser.urlencoded({ extended: false }));
delta.use(cookieParser());
delta.use(express.static(path.join(__dirname, 'public')));

delta.use(function(req, res, next) {
  console.log(req.path)
  if(["/signin","/signin-attempt"].indexOf(req.path) > -1){
    next();
    return;
  }

  ssa.isLoggedIn(req.cookies.token, function(isLogged){
    console.log(isLogged)
    if(!isLogged)
      res.redirect("/signin");    
    else
      next();
  });

});


delta.get("/", function(req, res){
	ssa.getUserInformation(req.cookies.token, function(err, user){
		data = {};
		data.user = user;
		data.logged = true;
		ssa.getApplications(req.cookies.token, function(err, apps){
			data.apps = apps
			res.render("index", data);
		});    
	});
});


delta.get("/signin", function(req, res){
  if(!req.query.e)
    req.query.e = 0;
	res.render("signin", {errorCount:req.query.e, logged:false, title:"Please Sign In"});
});
delta.post("/signin-attempt", function(req, res){
  ssa.logIn(req.body.name, req.body.pass, function(err, token){
    if(err || !token){
      console.log("Signin Error:", err);
      res.redirect("/signin?e="+(++req.query.errorCount));
    }
    else{
      res.cookie('token', token, {expires:new Date(Date.now()+10800000)})
      res.redirect("/");
    }
  });
});
delta.get("/signout", function(req, res){
  ssa.logOut(req.cookies.token, function(err){
    res.redirect("/signin");
  });
});


// catch 404 and logged state before forward to error handler
delta.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

module.exports = delta;

delta.listen(1024);
