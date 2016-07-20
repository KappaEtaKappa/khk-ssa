var crypto = require('crypto');
function hash(data){
	return crypto.createHash('md5').update(data).digest("hex");
}

function sendTo(callback, err, val, dataname){
	if(err)
		console.log("Failed to get " +dataname+ ". Error: " +err);
	if(!val)
		console.log("Data not found. [" +val+ "]");
	callback(err, val);
}

module.exports = function(){

	var fs = require('fs');

	var dbPath = __dirname + '/db.sqlite'
	var dbExists = fs.existsSync(dbPath);
	console.log(dbPath, dbExists)
	var sqlite3 = require('sqlite3').verbose();
	var db = new sqlite3.Database(dbPath);

	if(!dbExists){
		db.run("CREATE TABLE users (user_id INTEGER, name TEXT, hash BLOB, privilegeLevel INTEGER, loggedInSince INTEGER);");
		db.run("CREATE TABLE apps (app_id INTEGER, name TEXT, privilegeRequired INTEGER, subdomain TEXT, icon TEXT, image TEXT);");
		db.run("CREATE TABLE access (user_id INTEGER, token BLOB, exp_date INTEGER);");
	}

	return {
		getApplications:function(token, callback){
			this.getPriviledgeLevel(token, function(err, level){
				db.all("SELECT * FROM apps WHERE privilegeRequired < ?", level, function(err, apps){
					console.log(apps);
					sendTo(callback, err, apps, "applications");
				});
			});
		},
		isLoggedIn:function(token, callback){
			db.get("SELECT * FROM access WHERE token = ?;", token, function(err, access){
				console.log(err, access);
				if(err)
					throw err;
				else if(!access || access.exp_date < (new Date().getTime()))
					callback(false);
				else
					callback(true);
			})
		},
		getPriviledgeLevel:function(token, callback){
			db.get("SELECT * FROM access WHERE token = ?;", token, function(err, access){
				if(err)
					throw err;
				else if(!access)
					callback("User not logged in.", null)
				else
					db.get("SELECT privilegeLevel FROM users WHERE user_id = ?", access.user_id, function(err, user){
						if(err || !user)
							throw "Serious database error, Error: " + err + "\nUser: " + user;
						else
							callback(null, user.privilegeLevel);
					});
			});
		},
		getUserInformation:function(token, callback){
			db.get("SELECT * FROM access WHERE token = ?;", token, function(err, access){
				if(err)
					throw err;
				else if(!access)
					callback("User not logged in.", null)
				else
					db.get("SELECT user_id, name, privilegeLevel, loggedInSince FROM users WHERE user_id = ?", access.user_id, function(err, user){
						if(err || !user)
							throw "Serious database error, Error: " + err + "\nUser: " + user;
						else
							callback(null, user);
					});
			});
		},
		logIn:function(name, pass, callback){
			db.get("SELECT user_id, hash FROM users where name = ?;", name, function(err, entry){
				if(err)
					callback("Failed to log in. Error: " + err, null);
				else if(entry.hash == null || hash(pass) != entry.hash)
					callback("Failed to log in. Password does not match", null);
				else {
					var tokenToBe = hash(entry.name+entry.hash+(Date.now())+Math.random());
					db.run("INSERT INTO access VALUES ('" +entry.user_id+ "', '" +tokenToBe+ "', " + (Date.now() + 10800000) + ");", function(err){//+3 hours
						if(err)
							callback("Failed to log in. Error: " + err, null);
						else
							callback(null, tokenToBe);
					});
				}
			});
		},
		logOut:function(token, callback){
			db.run("DELETE FROM access WHERE token = ?", token, function(err){
				if(err)
					callback("Failed to log out. Error: " + err);
				else
					callback(null);
			});
		}
	}
}
