module.exports = {
	isLoggedIn:function(){
		return true;
	},
	privilegeLevel:function(){
		return 1;
	},
	getUserInformation:function(){
		var user = {
			name:"admin",
			id:undefined,
			approvedApps:[],
			privilegeLevel:2,
			loggedInSince:undefined
		};
		return user;
	},
	logOut:function(){
		return true;
	}
}
