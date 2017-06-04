import { Observable } from 'rxjs';
import { cloneDeep } from 'lodash';

//const debuggerOn = true;

Observable.prototype.storeElement = function (element: string) { 
	return this.do( 
   		nextValue => { 
   			/*if(debuggerOn){
				  console.log('Observer Debug-I: ' + message, (nextValue.type || nextValue));
   			}*/
            return nextValue.map(data => cloneDeep(data[element]);
   		},
   		error => { 
   			if(debuggerOn){ 
				console.error('Observer Debug-E: ' + message, (error));
   			}
   		},
   		() => { 
				console.error('Observer Debug-C: ' + message);
   		}	

   	);
};

declare module 'rxjs/Observable' {
   interface Observable<T> {
      storeElement: (...any) => Observable<T>;
   }
}
