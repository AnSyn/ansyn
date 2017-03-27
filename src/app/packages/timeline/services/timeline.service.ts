import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';

import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';


@Injectable()
export class TimelineService {
	private dataUrl = "//localhost:8037/api/mock/eventDrops/data";
  	
  	//@Observable data;

  	constructor(private http:Http ) { 

  	}

  	//@todo add support for parsing callback function 
  	fetchData (url?:string): Observable<any[]>{
    	let tmp = url;
    	if(!tmp){
    		tmp = this.dataUrl;
    	} 
    	
    	return this.http.get(tmp)
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
 