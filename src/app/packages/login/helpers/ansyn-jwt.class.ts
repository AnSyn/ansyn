import HmacSHA256 from 'crypto-js/hmac-sha256';
import Base64 from 'crypto-js/enc-base64';
import Utf8 from 'crypto-js/enc-utf8';

export class AnsynJwt {
	public base64;
	public utf8;
	public hmacSha256;

	constructor(){
		this.base64 = Base64;
		this.utf8 = Utf8;
		this.hmacSha256 = HmacSHA256;
	}

	static get roles() {
		return {
			ADMIN: 'ADMIN',
			USER: 'USER',
			GUEST: 'GUEST'
		}
	};

	createJWT(header, payload) {
		const now = Date.now();
		let exp = now;
		switch (payload.role){
			case AnsynJwt.roles.ADMIN:
				exp += this.year();
				break;
			case AnsynJwt.USER:
				exp += this.month();
				break;
			case AnsynJwt.GUEST:
				exp += this.week();
				break;
		}
		payload.exp = exp;
		const token = this.encode(header) + '.' + this.encode(payload);
		return token + "." + this.encodeSigneture(token,now.toString());
	}

	day() {
		return 60 * 60 * 24;
	}

	month() {
		return this.day() * 30;
	}

	year() {
		return this.month() * 12;
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
		let jwtValues = jwt.split('.');
		if(jwtValues.length !== 3){
			return false;
		}
		const [header, data, signeture] = [...jwtValues];
		const payload = this.decode(data);
		let key = payload.exp;
		switch (payload.role){
			case AnsynJwt.roles.ADMIN:
				key -= this.year();
				break;
			case AnsynJwt.roles.USER:
				key -= this.month();
				break;
			case AnsynJwt.roles.GUEST:
				key -= this.week();
				break;
		}
		return signeture === this.encodeSigneture(header + '.' + data,key.toString());
	}

	getPayload(jwt){
		const [header, data, signeture] = [...jwt.split('.')];
		const payload = this.decode(data);
		return payload;
	}

}
