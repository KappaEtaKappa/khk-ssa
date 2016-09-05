//shorthands claims namespaces
var fm = {
  'nameIdentifier': 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier',
  'email': 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress',
  'name': 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name',
  'givenname': 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname',
};

/**
 *
 * Passport User Profile Mapper
 *
 * A class to map passport.js user profile to a wsfed claims based identity.
 *
 * Passport Profile:
 * http://passportjs.org/guide/profile/
 * 
 * Claim Types:
 * http://msdn.microsoft.com/en-us/library/microsoft.identitymodel.claims.claimtypes_members.aspx
 * 
 * @param  {Object} pu Passport.js user profile
 */
function KHKProfileMapper (pu) {
  if(!(this instanceof KHKProfileMapper)) {
    return new KHKProfileMapper(pu);
  }
  this._pu = pu;
}

/**
 * map passport.js user profile to a wsfed claims based identity.
 * 
 * @return {Object}    WsFederation claim identity
 */
KHKProfileMapper.prototype.getClaims = function () {
  var claims = {};

  claims[fm.nameIdentifier]  = "khk@do.khk.org";
  claims[fm.email]           = "khk@do.khk.org";
  claims[fm.name]            = "KHK";
  claims[fm.givenname]       = "Account";

  return claims;
};

/**
 * returns the nameidentifier for the saml token.
 * 
 * @return {Object} object containing a nameIdentifier property and optional nameIdentifierFormat.
 */
KHKProfileMapper.prototype.getNameIdentifier = function () {
  return {
    nameIdentifier: "khk@do.khk.org"
  };
};

/**
 * claims metadata used in the metadata endpoint.
 * 
 * @param  {Object} pu Passport.js profile
 * @return {[type]}    WsFederation claim identity
 */
KHKProfileMapper.prototype.metadata = [ {
  id: "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress",
  optional: true,
  displayName: 'E-Mail Address',
  description: 'The e-mail address of the user'
}, {
  id: "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname",
  optional: true,
  displayName: 'Given Name',
  description: 'The given name of the user'
}, {
  id: "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name",
  optional: true,
  displayName: 'Name',
  description: 'The unique name of the user'
}, {
  id: "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier",
  optional: true,
  displayName: 'Name ID',
  description: 'The SAML name identifier of the user'
}];

module.exports = KHKProfileMapper;
