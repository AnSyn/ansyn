import { ComponentFixture, inject, TestBed } from '@angular/core/testing';
import { AnsynComponent } from './ansyn.component';
import { MockComponent } from '../modules/core/public_api';
import { Store, StoreModule } from '@ngrx/store';
import { RouterTestingModule } from '@angular/router/testing';
import { of, Subject } from 'rxjs';
import { selectIsPinned } from '@ansyn/menu';
import { selectSelectedCase } from '../modules/menu-items/public_api';
import { mapStateSelector } from '@ansyn/map-facade';
import { COMPONENT_MODE } from '../app-providers/component-mode';

describe('AnsynComponent', () => {
	let component: AnsynComponent;
	let fixture: ComponentFixture<AnsynComponent>;
	let store: Store<any>;
	let handler: Subject<any>;

	const mockMenu = MockComponent({ selector: 'ansyn-menu', inputs: ['version', 'animatedElement'] });
	const mockToast = MockComponent({ selector: 'ansyn-toast', inputs: ['duration'] });
	const mockStatus = MockComponent({
		selector: 'ansyn-status-bar',
		inputs: ['selectedCaseName', 'activeMap']
	});
	const mockOverlaysContainer = MockComponent({ selector: 'ansyn-overlays-container' });
	const mockEmptyComponent = MockComponent({ selector: 'ansyn-empty' });
	const mockImageryView = MockComponent({ selector: 'ansyn-imageries-manager' });
	const mockOverlayOverviewComponent = MockComponent({ selector: 'ansyn-overlay-overview' });

	const mapState = {
		mapsList: [
			{
				id: 'imagery1',
				data: {
					position: {
						zoom: 1, center: 2, boundingBox: { test: 1 }
					},
					isHistogramActive: false,
					overlay: { id: 'overlayId1' }
				}
			},
			{ id: 'imagery2', data: { position: { zoom: 3, center: 4 } } },
			{ id: 'imagery3', data: { position: { zoom: 5, center: 6 } } }
		],
		activeMapId: 'imagery1'
	};

	beforeEach(() => {
		TestBed.configureTestingModule({
			declarations: [
				AnsynComponent,
				mockImageryView,
				mockMenu,
				mockToast,
				mockOverlaysContainer,
				mockStatus,
				mockImageryView,
				mockEmptyComponent,
				mockOverlayOverviewComponent,
			],
			providers: [
				{
					provide: COMPONENT_MODE,
					useValue: false
				}
			],
			imports: [
				RouterTestingModule,
				StoreModule.forRoot({})]
		}).compileComponents();
	});

	beforeEach(inject([Store], (_store: Store<any>) => {
		store = _store;
		handler = new Subject();
		const mockStore = new Map<any, any>([
			[mapStateSelector, mapState],
			[selectSelectedCase, { name: 'Case name' }],
			[selectIsPinned, true]
		]);
		spyOn(store, 'select').and.callFake(type => of(mockStore.get(type)));


	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(AnsynComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should be created', () => {
		expect(component).toBeTruthy();
	});

});
