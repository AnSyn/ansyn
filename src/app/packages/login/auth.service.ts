import { Injectable} from '@angular/core';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class AuthService{
	constructor(){}

	logout(){

	}

	login(userName: string,password: string){
		return Observable.create();
	}
}
