import { TestBed, inject } from '@angular/core/testing';
import { Subject } from 'rxjs/Rx';
import { TimelineEmitterService } from './timeline-emitter.service';

describe('TimelineEmitterService', () => {
  
	let timeLineEmitterService:TimelineEmitterService;
  
	beforeEach(() => {
		TestBed.configureTestingModule({
		  providers: [TimelineEmitterService]
		});
	});

	beforeEach(inject([TimelineEmitterService], (_timelineEmitterService) => {     
   		timeLineEmitterService = _timelineEmitterService;
   	}));

	it('should check that the service is fires event',() => {
		expect(timeLineEmitterService).toBeTruthy();
	});

	it('check the provide function ', () => {     
   		const result:any = timeLineEmitterService.provide('timeline:click');
   		expect(result.constructor.name).toBe('Subject');
   		expect(result instanceof Subject).toBe(true);
 	});

	it('check that next actully fires an event', () => {
		timeLineEmitterService
			.provide('timeline:mouseout')
			.subscribe((data) => {     
        		expect(data.key).toBe('value');
        	})
   		timeLineEmitterService.provide('timeline:mouseout').next({key:'value'});
   	})

	it('check the subscribe function',()=>{
		timeLineEmitterService.subscribe('timeline:mouseout',(data)=>{
				expect(data.key).toBe('value');
			});
		timeLineEmitterService.provide("timeline:mouseout").next({key:'value'});
	});

	it('check the ask for wrong event will throw an error', () => {     
 		
 		expect( () => timeLineEmitterService.provide("name:string")).toThrow(new Error("name:string emitter does not exist "));
 	})
});
