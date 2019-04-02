import { async, ComponentFixture, fakeAsync, inject, TestBed, tick } from '@angular/core/testing';
import { ImageriesManagerComponent } from './imageries-manager.component';
import { MapEffects } from '../../effects/map.effects';
import { Store, StoreModule } from '@ngrx/store';
import { IMapState, mapFeatureKey, MapReducer } from '../../reducers/map.reducer';
import { ImageryCommunicatorService } from '@ansyn/imagery';
import { TranslateModule } from '@ngx-translate/core';
import { mapFacadeConfig } from '../../models/map-facade.config';
import { SetActiveMapId, SetLayoutAction, SetMapsDataActionStore } from '../../actions/map.actions';
import { MockComponent } from '../../test/mock-component';
import { AlertComponentDirective } from '../../alerts/alert-component.directive';
import { Actions } from '@ngrx/effects';
import { MapFacadeService } from '../../services/map-facade.service';

const mockAnsynContextMenu = MockComponent({
	selector: 'ansyn-context-menu',
	inputs: ['show', 'top', 'left'],
	outputs: ['showChange']
});
const mockAnsynImageryContainer = MockComponent({
	selector: 'ansyn-imagery-container',
	inputs: ['mapState', 'active', 'showStatus', 'showSpinner', 'notInCase', 'mapsAmount', 'isFavoriteOverlayDisplayed']
});
const mockAnnotationContextMenu = MockComponent({
	selector: 'ansyn-annotations-context-menu', inputs: ['mapId']
});
const mockAnsynWelcomeNotification = MockComponent({
	selector: 'ansyn-welcome-notification'
});

const mockAnsynPopoverComponent = MockComponent({
	selector: 'ansyn-popover',
	inputs: ['text', 'icon', 'popDirection']
});

const mockAnsynComboBox = MockComponent({
	selector: 'ansyn-combo-box',
	inputs: ['ngModel', 'toolTipField', 'comboBoxToolTipDescription', 'direction', 'color', 'icon'],
	outputs: ['ngModelChange']
});

const mockComboBoxOptionComponent = MockComponent({
	selector: 'ansyn-combo-box-option',
	inputs: ['value'],
	outputs: []
});

describe('ImageriesManagerComponent', () => {
	let component: ImageriesManagerComponent;
	let fixture: ComponentFixture<ImageriesManagerComponent>;
	let mapEffects: MapEffects;
	let communicatorProvider: ImageryCommunicatorService;
	let store: Store<IMapState>;


	beforeEach(async(() => {
		TestBed.configureTestingModule({
			providers: [
				MapEffects,
				ImageryCommunicatorService,
				Actions,
				MapFacadeService,
				{ provide: mapFacadeConfig, useValue: { } }
			],
			imports: [
				TranslateModule.forRoot(),
				StoreModule.forRoot({ [mapFeatureKey]: MapReducer })
			],
			declarations: [
				ImageriesManagerComponent,
				mockAnsynComboBox,
				mockComboBoxOptionComponent,
				mockAnsynContextMenu,
				mockAnsynImageryContainer,
				mockAnnotationContextMenu,
				mockAnsynWelcomeNotification,
				mockAnsynPopoverComponent,
				AlertComponentDirective
			]

		}).compileComponents();
	}));

	beforeEach(inject([MapEffects, ImageryCommunicatorService, Store], (_mapEffects: MapEffects, _imageryCommunicatorService: ImageryCommunicatorService, _store: Store<IMapState>) => {
		mapEffects = _mapEffects;
		communicatorProvider = _imageryCommunicatorService;
		store = _store;
	}));


	beforeEach(() => {
		fixture = TestBed.createComponent(ImageriesManagerComponent);
		component = fixture.componentInstance;
		const mapsList = <any>[
			{ id: 'imagery1', data: { overlay: {} } },
			{ id: 'imagery2', data: { overlay: {} } }
		];
		const activeMapId = 'imagery1';
		store.dispatch(new SetLayoutAction('layout2'));
		store.dispatch(new SetMapsDataActionStore({ mapsList }));
		store.dispatch(new SetActiveMapId(activeMapId));

		fixture.detectChanges();
	});

	beforeEach(() => {
		const communicator = jasmine.createSpyObj('communicator', ['stopMouseShadowVectorLayer', 'setMouseShadowListener', 'drawShadowMouse', 'startMouseShadowVectorLayer']);

		// spyOn(communicator,'pointerMove').and.returnValue(Observable.create(observer => {} ));
		communicatorProvider.communicators = {
			'imagery1': communicator,
			'imagery2': communicator
		};
	});

	it('should be created', () => {
		expect(component).toBeTruthy();
	});

	it('emit change action event and change the active map id ', fakeAsync(() => {
		spyOn(component, 'changeActiveImagery');

		const wrapperDivs = fixture.debugElement.nativeElement.querySelectorAll('.map-container-wrapper');
		expect(wrapperDivs.length).toBe(2);

		wrapperDivs[0].click();
		tick(500);
		expect(component.activeMapId).toBe('imagery1');
		expect(component.changeActiveImagery).toHaveBeenCalledWith('imagery1');

		wrapperDivs[1].click();
		tick(500);
		expect(component.changeActiveImagery).toHaveBeenCalledWith('imagery2');
	}));
});

