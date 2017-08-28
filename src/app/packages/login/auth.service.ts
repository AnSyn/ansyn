import { Injectable} from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { hmacSHA256 } from 'crypto-js/hmac-sha256';
import Base64 from 'crypto-js/enc-base64';
import Utf8 from 'crypto-js/enc-utf8';
import { AnsynJwt } from './ansyn-jwt.class';
import { UUID } from 'angular2-uuid';

const roles = {
	ADMIN: Symbol('admin'),
	GUEST: Symbol('guest'),
	USER: Symbol('user')
}

@Injectable()
export class AuthService{
	public ansynJwt: AnsynJwt;

	constructor(){
		this.ansynJwt = new AnsynJwt(Base64,Utf8,hmacSHA256);
	}

	logout(){
		localStorage.setItem('user',undefined);
	}

	login(userName: string,password: string){
		const token = this.ansynJwt.createJWT({  alg: 'HS256',
			typ: 'JWT'},{
			user: "guest-user",
			role: roles.GUEST,
			id: UUID.UUID(),
		},true);

		localStorage.set('user',token);
		return Observable.of(this.ansynJwt.getPayload(token));
	}

	check(token){
		if(!token){
			return false;
		}
		if(this.ansynJwt.check(token)){
			const payload = this.ansynJwt.getPayload(token);
			if(payload.exp > Date.now()){
				return payload;
			}
			return false;
		}
		return false;
	}

}
