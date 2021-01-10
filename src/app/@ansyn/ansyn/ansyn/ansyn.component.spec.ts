import { ComponentFixture, inject, TestBed } from '@angular/core/testing';
import { AnsynComponent } from './ansyn.component';
import { MockComponent } from '../modules/core/test/mock-component';
import { Store, StoreModule } from '@ngrx/store';
import { RouterTestingModule } from '@angular/router/testing';
import { of, Subject } from 'rxjs';
import { selectIsPinned } from '@ansyn/menu';
import { selectSelectedCase } from '../modules/menu-items/cases/reducers/cases.reducer';
import { mapStateSelector, selectFooterCollapse } from '@ansyn/map-facade';
import { COMPONENT_MODE } from '../app-providers/component-mode';
import { toolsConfig } from '../modules/status-bar/components/tools/models/tools-config';
import { LoggerService } from '../modules/core/services/logger.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

describe('AnsynComponent', () => {
	let component: AnsynComponent;
	let fixture: ComponentFixture<AnsynComponent>;
	let store: Store<any>;
	let handler: Subject<any>;

	const mockContextMenu = MockComponent({ selector: 'ansyn-context-menu' });
	const mockMenu = MockComponent({ selector: 'ansyn-menu', inputs: ['version', 'animatedElement'] });
	const mockToast = MockComponent({ selector: 'ansyn-toast', inputs: ['duration'] });
	const mockFooter = MockComponent({
		selector: 'ansyn-footer',
		inputs: ['activeMap', 'animatedElement']
	});
	const mockOverlaysContainer = MockComponent({ selector: 'ansyn-overlays-container' });
	const mockEmptyComponent = MockComponent({ selector: 'ansyn-empty' });
	const mockImageryView = MockComponent({ selector: 'ansyn-imageries-manager' });
	const mockOverlayOverviewComponent = MockComponent({ selector: 'ansyn-overlay-overview' });
	const mockStatusBar = MockComponent({
		selector: 'ansyn-status-bar'
	});

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
				mockContextMenu,
				mockImageryView,
				mockMenu,
				mockToast,
				mockOverlaysContainer,
				mockFooter,
				mockImageryView,
				mockEmptyComponent,
				mockStatusBar,
				mockOverlayOverviewComponent
			],
			providers: [
				{
					provide: LoggerService,
					useValue: {
						beforeAppClose: () => {}
					}
				},
				{
					provide: COMPONENT_MODE,
					useValue: false
				},
				{
					provide: toolsConfig,
					useValue: {}
				},
				TranslateService
			],
			imports: [
				RouterTestingModule,
				TranslateModule.forRoot(),
				StoreModule.forRoot({})]
		}).compileComponents();
	});

	beforeEach(inject([Store], (_store: Store<any>) => {
		store = _store;
		handler = new Subject();
		const mockStore = new Map<any, any>([
			[mapStateSelector, mapState],
			[selectSelectedCase, { name: 'Case name' }],
			[selectIsPinned, true],
			[selectFooterCollapse, false]
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
