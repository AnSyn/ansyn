import { async, ComponentFixture, TestBed, inject, tick, fakeAsync } from '@angular/core/testing';
import { ImageriesManagerComponent } from './imageries-manager.component';
import { MockComponent } from '@ansyn/core/test';
import { ImageryCommunicatorService } from '@ansyn/imagery';
import { MapEffects } from '../../effects/map.effects';
import { MapFacadeService } from '../../services/map-facade.service';
import { Actions } from '@ngrx/effects';
import { Dispatcher, StoreModule } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { MapReducer } from '../../reducers/map.reducer';

const mock_ansyn_context_menu = MockComponent({selector: 'ansyn-context-menu', inputs: ['show', 'top', 'left'], outputs: ['showChange']});
const mock_ansyn_imagery_container = MockComponent({selector: 'ansyn-imagery-container', inputs: ['map-state', 'active','show-status', 'showSpinner']});

describe('ImageriesManagerComponent', () => {
	let component: ImageriesManagerComponent;
	let fixture: ComponentFixture<ImageriesManagerComponent>;
	let mapEffects: MapEffects;
	let communicatorProvider: ImageryCommunicatorService;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			providers: [
				MapEffects,
				ImageryCommunicatorService,
				Actions,
				Dispatcher,
				MapFacadeService
			],
			imports:[StoreModule.provideStore({key:'value', map: MapReducer})],
			declarations: [ ImageriesManagerComponent, mock_ansyn_context_menu, mock_ansyn_imagery_container],

		})
		.compileComponents();
	}));

	beforeEach(inject([MapEffects,ImageryCommunicatorService],(_mapEffects: MapEffects,_imageryCommunicatorService:ImageryCommunicatorService) => {
		mapEffects = _mapEffects;
		communicatorProvider = _imageryCommunicatorService;
	}));


	beforeEach(() => {
		fixture = TestBed.createComponent(ImageriesManagerComponent);
		component = fixture.componentInstance;

		component.selected_layout = {
			id: '1',
			description: '',
			maps_count: 2
		};
		component.maps = {
			active_map_id:'imagery1',
			data: [
				{id: 'imagery1', data: {overlay: {}}},
				{id: 'imagery2', data: {overlay: {}}}
			]
		};

		fixture.detectChanges();
	});

	beforeEach(() => {
		const communicator = jasmine.createSpyObj('communicator',['stopMouseShadowVectorLayer','toggleMouseShadowListener','drawShadowMouse','startMouseShadowVectorLayer']);
		communicator.pointerMove =  Observable.create(observer => {});

		//spyOn(communicator,'pointerMove').and.returnValue(Observable.create(observer => {} ));
		const list = {
			"imagery1": communicator,
			"imagery2": communicator
		};
		spyOnProperty(communicatorProvider,'communicators','get').and.returnValue(list);
	});

	it('should be created', () => {
		expect(component).toBeTruthy();
	});

	it('check that all events are called ',()=> {
		spyOn(component,'changeShadowMouseTarget');
		spyOn(component,'stopPointerMoveProcess');
		spyOn(component,'startPointerMoveProcess');
		//component.maps.data
		//I want to fake and observable and then call him and check if the function has been called
		//I can dispathc the actions
		mapEffects.onComposeMapShadowMouse$ = Observable.create( observer => {
			observer.next();
		});

		mapEffects.onStopMapShadowMouse$ = Observable.create( observer => {
			observer.next();
		});

		mapEffects.onStartMapShadowMouse$ = Observable.create( observer => {
			observer.next();
		});

		component.initListeners();
		expect(component.changeShadowMouseTarget).toHaveBeenCalled();
		expect(component.stopPointerMoveProcess).toHaveBeenCalled();
		expect(component.startPointerMoveProcess).toHaveBeenCalled();

	});

	it('emit change action event and chagne the active map id ',fakeAsync(()=> {
		//spyOn(component,'changeShadowMouseTarget');
		spyOn(component.setActiveImagery,'emit');

		const wrapperDivs = fixture.debugElement.nativeElement.querySelectorAll(".map-container-wrapper");
		expect(wrapperDivs.length).toBe(2);

		wrapperDivs[0].click();
		tick(500);
		expect(component.maps.active_map_id).toBe('imagery1');
		expect(component.setActiveImagery.emit['calls'].any()).toBeFalsy();

		wrapperDivs[1].click();
		tick(500);
		expect(component.setActiveImagery.emit).toHaveBeenCalledWith('imagery2');
	}));

	it('activeate shadow mouse',() => {
		//spyOn(communicatorProvider,'communicators');
		component.startPointerMoveProcess();

		expect(communicatorProvider.communicators['imagery1']).toBeTruthy();

		expect(component.listenersMouseShadowMapsId.length).toBe(1);

		expect(communicatorProvider.communicators['imagery1']
				.toggleMouseShadowListener).toHaveBeenCalled();

		expect(communicatorProvider.communicators['imagery2']
				.startMouseShadowVectorLayer).toHaveBeenCalled();

		expect(component.shadowMouseProcess).toBe(true);


	});

	it('draw shadow mouse',() => {
		const latLon = [10,10];
		component.listenersMouseShadowMapsId = ['imagery2'];
		component.drawShadowMouse((latLon));
		expect(communicatorProvider.communicators['imagery2'].drawShadowMouse).toHaveBeenCalledWith(latLon);
	});

	it('stop shadow mouse listeners',() => {
		component.startPointerMoveProcess();

		expect(component.pointerMoveUnsubscriber).toBeTruthy();
		spyOn(component.pointerMoveUnsubscriber,'unsubscribe');
		component.stopPointerMoveProcess();

		expect(communicatorProvider.communicators['imagery1'].toggleMouseShadowListener).toHaveBeenCalled();
		expect(component.pointerMoveUnsubscriber.unsubscribe).toHaveBeenCalled();
		expect(communicatorProvider.communicators['imagery2'].stopMouseShadowVectorLayer).toHaveBeenCalled();

		expect(component.listenersMouseShadowMapsId.length).toBe(0);
		expect(component.publisherMouseShadowMapId).toBe(null);
		expect(component.shadowMouseProcess).toBe(false);


	});




});

