module.exports = {
	isLoggedIn:function(){
		return true;
	},
	privilegeLevel(){
		return 1;
	},
	getUserInformation(){
		var user = {
			name:undefined,
			id:undefined,
			approvedApps:[],
			loggedInSince:undefined
		};
		return user;
	},
	logOut:function(){
		return true;
	}
}
