import { Injectable } from '@angular/core';
import { Http, Response,Headers,RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Observable';

import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';


@Injectable()
export class TimelineService {
	//private dataUrl = "//localhost:8037/api/mock/eventDrops/data";
  private dataUrl = "http://localhost:9001/api/v1/overlays";
  	
  	constructor(private http:Http ) { 
	}

  	//@todo add support for parsing callback function 
  	fetchData ({url="",params={}}: {url?:string,params?:any} = {}): Observable<any[]>{
    	let tmp = url;
    	
    	let headers = new Headers({ 'Content-Type': 'application/json' });
    	let options = new RequestOptions({ headers: headers });

    	if(!tmp){
    		tmp = this.dataUrl;
    	} 

    	const data = JSON.stringify(params);
    	return this.http.post(tmp,data,options)
					.map(this.extractData)
					.catch(this.handleError);
  	}

	

  	extractData(response: Response){
  		let data = response.json();
	  	return data || [];
  	}

  	handleError(error: Response | any):any{
  		let errorMessage: string;
      	const _error = error;
  		if(error instanceof Response){
  			const body = _error.json() || '';
  			const error = body.error || JSON.stringify(body);
  			errorMessage = `${error.status} - ${error.statusText || ''} ${error}`;
  		}
  		else{
  			errorMessage = error.message ? error.message : error.toString();
  		}
  		return Observable.throw(errorMessage);
  	}
}

 