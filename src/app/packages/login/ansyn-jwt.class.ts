/**
 * usage example
 * const uuidv5 = require('uuid/v5');
 const CryptoJS = require('crypto-js');
 const utf8 = require('crypto-js/enc-utf8');
 const base64 = require('crypto-js/enc-base64');
 const hmacSHA256 = require('crypto-js/hmac-sha256');
 const AnsynJwt = require('./libs/jwt').AnsynJwt;

 const roles = {
    "ADMIN": Symbol("admin"),
    "USER": Symbol("user"),
    "GUEST": Symbol("guest")

}

 const payload = {
    name: "Ohad Sadan",
    id: uuidv5('www.example.com', uuidv5.DNS),
    role: roles.ADMIN,
    exp: undefined,
    rememberMe: undefined
};

 const header = {
    alg: 'HS256',
    typ: 'JWT'
};

 const ansynJwt = new AnsynJwt(base64,utf8,hmacSHA256);

 const result = ansynJwt.createJWT(header,payload,true);
 if(ansynJwt.check(result)){
    console.log( ansynJwt.getPayload(result));
}
 *
 */
export class AnsynJwt{
	public base64;
	public utf8;
	public hmacSha256;

	constructor(base64,utf8,hmacSha256){
		this.base64 = base64;
		this.utf8 = utf8;
		this.hmacSha256 = hmacSha256;
	}


	createJWT(header,payload, rememberMe) {
		const now = Date.now();
		if (rememberMe) {
			payload.rememberMe = true;
			payload.exp = now + this.week();
		} else {
			payload.rememberMe = false;
			payload.exp = now + this.day();
		}

		const token = this.encode(header) + '.' + this.encode(payload);

		const jwt = token + "." + this.encodeSigneture(token,now.toString());
		return jwt;
	}

	day() {
		return 60 * 60 * 24;
	}

	week() {
		return this.day() * 7;
	}

	encode(source) {
		return this.base64.stringify(this.utf8.parse(JSON.stringify(source)));
	}

	decode(token){
		// CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(JSON.stringify(source)));
		return JSON.parse(this.utf8.stringify(this.base64.parse(token)));
	}

	encodeSigneture(token,salt){
		return this.base64.stringify( this.hmacSha256(token,salt));
	}

	check(jwt){
		const [header,data,signeture] = [...jwt.split('.')];
		const payload = this.decode(data);
		const key = payload.rememberMe ? payload.exp - this.week() : payload.exp - this.day();
		if(signeture === this.encodeSigneture( header + '.' + data,key.toString())){
			return true;
		}
		return false;
	}

	getPayload(jwt){
		const [header,data,signeture] = [...jwt.split('.')];
		const payload = this.decode(data);
		return payload;

	}
}



