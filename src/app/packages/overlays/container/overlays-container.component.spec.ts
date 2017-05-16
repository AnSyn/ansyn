import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MockComponent } from '@ansyn/core/test';
import { StoreFixture, createStore } from '@ansyn/core/test';
import { OverlaysContainer } from './overlays-container.component';
import { OverlaysService } from '../services/overlays.service';
import { TimelineEmitterService } from '../services/timeline-emitter.service';
import { Observable, Observer } from 'rxjs/Rx';
import { HttpModule } from '@angular/http';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import * as d3 from 'd3';

import { Overlay } from '../models/overlay.model';
import { StoreModule, Store, State, ActionReducer } from '@ngrx/store';

import { IOverlayState, OverlayReducer,overlayInitialState } from '../reducers/overlays.reducer';
import { LoadOverlaysAction, LoadOverlaysSuccessAction,SelectOverlayAction,UnSelectOverlayAction } from '../actions/overlays.actions';




describe('OverlayContainerComponent', () => {
  let component: OverlaysContainer;
  let fixture: ComponentFixture<OverlaysContainer>;
  let overlaysService: OverlaysService;
  let de: DebugElement;

  let storeFixture: StoreFixture<IOverlayState>;
  let store: Store<IOverlayState>;
  let state: State<IOverlayState>;
  let getState: () => IOverlayState;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
  		providers:[
  			OverlaysService,
  			TimelineEmitterService
  		],
  		declarations: [
      		OverlaysContainer,
      		MockComponent({selector: 'ansyn-timeline',inputs: ['drops','configuration']})
  		],
			imports: [HttpModule,StoreModule.provideStore( OverlayReducer)]
    })
    .compileComponents();

    storeFixture = createStore(OverlayReducer);
    store = storeFixture.store;
    getState = storeFixture.getState;
    state =  storeFixture.state; //(overlayInitialState);
    //state = overlayInitialState;
  }));

	beforeEach(() => {
		fixture = TestBed.createComponent(OverlaysContainer);
		component = fixture.componentInstance;
		fixture.detectChanges();
		overlaysService = fixture.debugElement.injector.get(OverlaysService);

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


	xit('should call store dispatch on ngOnInit with LoadOverlayAction',() => {
		spyOn(store,'dispatch').and.callThrough();
		component.ngOnInit();
		const expectedResult = new LoadOverlaysAction();
		expect(store.dispatch).toHaveBeenCalledWith(expectedResult);
	});

	it ('check the function toglle overlay', () => {
		spyOn(store,'dispatch');
		const id1 = '32313'
		const expectedResult1 = new SelectOverlayAction(id1);
		const expectedResult2 = new UnSelectOverlayAction(id1);

		component.toggleOverlay(id1);
		expect(store.dispatch).toHaveBeenCalledWith(expectedResult1);
		component.selectedOverlays.push(id1);
		component.toggleOverlay(id1);
		expect(store.dispatch).toHaveBeenCalledWith(expectedResult2);


	});



	it('should distinguish between changed data',() => {
		const overlays =  <Overlay[]>[
			{
         		id: '12',
         		name: 'tmp12',
         		photoTime: new Date(Date.now()),
         		azimuth: 10
         	},
         	{
         		id: '13',
         		name: 'tmp13',
         		photoTime: new Date(Date.now()),
         		azimuth: 10
           	}
       	]
       	const filter = {
       		
       	}
		store.dispatch(new LoadOverlaysAction());
		expect(state.value.loading).toBe(true);
		store.dispatch(new LoadOverlaysSuccessAction(overlays));
		expect(state.value.overlays.size).toEqual(2);
		expect(state.value.loading).toBe(false);

	});
	/*
		this is nice test I am keeping it as an example
	 */
	xit('check that fetchData has been called', () => {
		spyOn(overlaysService,'fetchData').and.callFake(()=>{
				return Observable.create( (observer: Observer<any>) =>{
					observer.next({key: 'value'});
				});
			});
		component.ngOnInit();
		expect(overlaysService.fetchData).toHaveBeenCalled();
	})


	it('check that the container div is in he\'s place',()=> {
		de = fixture.debugElement.query(By.css('.overlays-container'));
		expect(de.nativeElement.childElementCount).toBe(1);

	});

	xit("should unsubscribe from subscribers on ngOnDestroy", () => {
		//spyOn()
	});
});
