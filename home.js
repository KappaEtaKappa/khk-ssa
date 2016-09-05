var fs = require('fs');
var path = require('path');
var idp = require(path.join(__dirname, './modules/samljs')).IdentityProvider();
var cert = fs.readFileSync(path.join(__dirname, '../../cert/publickey.cer'), 'utf8');
var key = fs.readFileSync(path.join(__dirname, '../../cert/privatekey.pem'), 'utf8');

var express = require('express');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var delta = express();

var ssa = require(__dirname + '/khk-access')(delta);

// view engine setup
delta.set('views', path.join(__dirname, 'views'));
delta.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//delta.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
//adelta.use(logger('dev'));
delta.use(bodyParser.json());
delta.use(bodyParser.urlencoded({ extended: false }));
delta.use(cookieParser());
delta.use(express.static(path.join(__dirname, 'public')));

passedRoutes = [
	"/signin",
	"/signin-attempt",
	"/idp"
]

delta.use(function(req, res, next) {
  console.log("Endpoint hit:", req.path);
  if(passedRoutes.indexOf(req.path) > -1){
    next();
    return;
  }

  ssa.isLoggedIn(req.cookies.token, function(isLogged){
    if(!isLogged)
      res.redirect("/signin?rf=req.path");    
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

delta.get("/idp", function(req, res){
	if(req.query.SAMLRequest){
		idp.decodeAndParseAuthenticationRequest({SAMLRequest:req.query.SAMLRequest}, function(err, samlReq){
			if(err || !samlReq){
				console.log('Request Error:', err);
				res.redirect("/signin");
				return;
			}
			ssa.getUserInformation(req.cookies.token, function(err, user){
				if(err || !user){
					console.log('Request Error:', err);
					res.render("signin", {errorCount:0, logged:false, title:"Please Sign In", rf:"http://drive.do.khk.org"});
					return;
				}
				console.log(samlReq);
				var settings = {};
				settings.sp = samlReq;
				settings.idp = {
					issuer: 'do.khk.org',
					nameQualifier: 'do.khk.org',
					privateKey: key,
					cert: cert
				}
				settings.subject = {
					email: 'khk@do.khk.org',
					sessIndex: "",
					attributes: [
						{
							name:"emailAddress",
							value:"khk@do.khk.org"
						},
						{
							name:'username',
							value:'khk@do.khk.org',
						},
						{
							name:'user',
							value:'khk@do.khk.org'
						}
					]
				}
				settings.conditions = {
					notOnOrAfter: new Date(Date.now() + 10800000).toISOString(),
					notBefore: new Date(Date.now()).toISOString(),
					audience: samlReq.acsUrl
				};
				idp.generateAuthenticationResponse(settings, function(err, samlResponse){
					if(err || !samlResponse){
						console.log("Response Err:", err);
						res.redirect("/signin");
						return;
					}					
					res.render('saml', {SAMLresponse:samlResponse, RelayState:req.query.RelayState, logged:true, title:"Logging you in to Google Drive", user:user});   
				});
			});
		});
	} else res.redirect("/signin");
});


delta.get("/signin", function(req, res){
  if(!req.query.e)
    req.query.e = 0;
	res.render("signin", {errorCount:req.query.e, logged:false, title:"Please Sign In", rf:req.path});
});
delta.post("/signin-attempt", function(req, res){
  ssa.logIn(req.body.name, req.body.pass, function(err, token){
    if(err || !token){
      console.log("Signin Error:", err);
      res.redirect("/signin?e="+(++req.query.errorCount));
    }
    else{
      res.cookie('token', token, {expires:new Date(Date.now()+10800000), domain : "do.khk.org" })
			if(req.body.rf)
				res.redirect(req.body.rf);
			else
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
  console.log(req.path);
  next(err);
});

module.exports = delta;

delta.listen(1024);
