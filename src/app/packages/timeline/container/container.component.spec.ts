import { async, ComponentFixture, TestBed, getTestBed } from '@angular/core/testing';
import { MockComponent } from '../../../helpers/mock-component';
import { StoreFixture,createStore } from '../../../helpers/mock-store';
import { ContainerComponent } from './container.component';
import { TimelineService } from '../services/timeline.service';
import { TimelineEmitterService } from '../services/timeline-emitter.service';
import { Subscription,Observable,Observer } from 'rxjs/Rx';
import { HttpModule } from '@angular/http';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import * as d3 from 'd3';

import { StoreModule, Store, State, ActionReducer } from '@ngrx/store';

import { IOverlayState, reducer } from '../reducers/timeline.reducer';
import { LoadOverlaysAction } from '../actions/timeline.actions';




describe('ContainerComponent', () => {
  let component: ContainerComponent;
  let fixture: ComponentFixture<ContainerComponent>;
  let timeLineService: TimelineService;
  let de: DebugElement;

  let storeFixture: StoreFixture<IOverlayState>;
  let store: Store<IOverlayState>;
  let getState: () => IOverlayState;
  
  


  beforeEach(async(() => {
    TestBed.configureTestingModule({
  		providers:[
  			TimelineService,
  			TimelineEmitterService
  		],
  		declarations: [
      		ContainerComponent,
      		MockComponent({selector: 'timeline',inputs: ['drops','configuration']}) 
  		],
			imports: [HttpModule,StoreModule.provideStore(reducer)]
    })
    .compileComponents();

    storeFixture = createStore(reducer);
    store = storeFixture.store;
    getState = storeFixture.getState;
  }));

	beforeEach(() => {
		fixture = TestBed.createComponent(ContainerComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
		timeLineService = fixture.debugElement.injector.get(TimelineService);
		
	});


	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should call store.select("overlays") on ngOnInit',() => { 
		spyOn(store,'select').and.callFake(()=> { 
			return Observable.of({key: 'value'});	
		});
		component.ngOnInit();
		expect(store.select).toHaveBeenCalledWith('overlays');
	});

	it('should call store dispatch on ngOnInit with LoadOverlayAction',() => { 
		spyOn(store,'dispatch').and.callThrough();
		component.ngOnInit();
		const expectedResult = new LoadOverlaysAction();
		expect(store.dispatch).toHaveBeenCalledWith(expectedResult);
	});

	/*
		this is nice test I am keeping it as an example
	 */
	xit('check that fetchData has been called', () => {     
		spyOn(timeLineService,'fetchData').and.callFake(()=>{
				return Observable.create( (observer: Observer<any>) =>{
					observer.next({key: 'value'});	
				});
			});
		component.ngOnInit();
		expect(timeLineService.fetchData).toHaveBeenCalled();
	})


	it('check that the container div is in he\'s place',()=> {
		de = fixture.debugElement.query(By.css('.timeline-container'));	
		expect(de.nativeElement.childElementCount).toBe(1);

	});
});
