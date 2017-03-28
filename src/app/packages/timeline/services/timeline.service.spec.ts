import { TestBed, inject } from '@angular/core/testing';

import { TimelineService } from './timeline.service';

import { HttpModule,XHRBackend,Response,ResponseOptions,Http } from '@angular/http';

import { MockBackend } from '@angular/http/testing';

import { Observable ,Observer} from 'rxjs';


describe('TimelineService', () => {
  let timeLineService,mockBackend,lastConnection,http ;

  let response = 	{ data : [ 
			{key: "a",value: 1},
			{key: "b",value: 2} 
			]};

	beforeEach(() => {
		TestBed.configureTestingModule({
		  providers: [
		  	TimelineService,
		  	{ provide: XHRBackend, useClass: MockBackend }
		  ],
		  imports:[HttpModule]
		});
	});

  	beforeEach( inject([TimelineService,XHRBackend,Http], (_timeLineService,_mockBackend,_http) => {
  		timeLineService = _timeLineService;
  		mockBackend = _mockBackend;
  		http = _http;

  		mockBackend.connections.subscribe( (connection:any) => {
    		if(connection.request.url == "//localhost:8037/api/mock/eventDrops/data") { 		
	      		connection.mockRespond(new Response( new ResponseOptions({
	      			body: JSON.stringify(response)
	      		})));
      		}

      		if(connection.request.url == "error") {
      			connection.mockError(new Error('Username or password is incorrect'));
      		}
    	});

 	}));

	it('check all dependencies are defined properly', () => {
		expect(timeLineService).toBeTruthy();
		
	});

	it('check the method fetchData with mock data', () => {     
 		
 		timeLineService.fetchData().subscribe(result => {     
     		expect(result.data.length).toBe(2);
     	});
 		
 	});

	it('check the method fetchData with spyOn', () => {
		let response = new Response( new ResponseOptions({
	      			body: JSON.stringify({key:'value'})
  		}));
		
		spyOn(http, 'get').and.callFake(function() {
			return Observable.create((observer:Observer<any>) => {     
            	observer.next(response); 	   	
            });
		});
		
		timeLineService.fetchData('tmp').subscribe(result => {     
        	expect(result.key).toBe('value'); 
     	});
     	
     	response = new Response( new ResponseOptions({
  			body: JSON.stringify({key:'value2'})
  		}));
  		
  		timeLineService.fetchData('tmp').subscribe(result => {     
        	expect(result.key).toBe('value2' ); 
     	});
  	})

 	it('check the function extract data', () => {     
 		let response = new Response( new ResponseOptions({
	      			body: JSON.stringify({key:'value'})
  		}));
 		
 		spyOn(http, 'get').and.callFake(function() {
			return Observable.create((observer:Observer<any>) => {     
            	observer.next(response); 	   	
            });
		});

		spyOn(timeLineService,"extractData");	

		timeLineService.fetchData('tmp').subscribe(result => {     
            expect(timeLineService.extractData).toHaveBeenCalled();
 		})

 	});

 	it('check the function handle error', () => { 
 		let response = new Response( new ResponseOptions({
	      			status: 404,
	      			statusText: 'file not found'
  		}));    
		spyOn(http, 'get').and.callFake(function() {
			return Observable.create((observer:Observer<any>) => {     
            	observer.error(response); 	   	
            });
		});

		spyOn(timeLineService,"handleError");	

		timeLineService.fetchData('error').subscribe(result => {     
			
		}, error => {     
        	expect(timeLineService.handleError.calls.any()).toEqual(true);
        }) 		
 	});

 	it('check the function handle bed response (not json)', () => { 
 		let response = new Response( new ResponseOptions({
	      			status: 404,
	      			statusText: 'file not found'
  		}));    
		spyOn(http, 'get').and.callFake(function() {
			return Observable.create((observer:Observer<any>) => {     
            	observer.next('some string'); 	   	
            });
		});

		spyOn(timeLineService,"handleError");	

		timeLineService.fetchData('tmp').subscribe(result => {     
			
		}, error => {     
        	expect(timeLineService.handleError.calls.any()).toEqual(true);
        }) 		
 	});
});
