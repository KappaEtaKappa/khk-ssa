var ssa = require(__dirname + '/khk-access');

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

delta.get("/", function(req, res){
	data = {};
	data.user = ssa.getUserInformation();
	data.logged = ssa.isLoggedIn();
	
    res.render("index", data);
});


// catch 404 and logged state before forward to error handler
delta.use(function(req, res, next) {
  if(!ssa.isLoggedIn(req))
    res.redirect("/signin");	  

  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

delta.get("/", function(req, res){
        res.render("index", {});
});

delta.get("/signin", function(req, res){
	res.render("signin", {});
});

module.exports = delta;

delta.listen(1024);
