import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ImageryContainerComponent } from './imagery-container.component';
import { IMapFacadeConfig } from '../../models/map-config.model';
import { mapFacadeConfig } from '../../models/map-facade.config';
import { HttpClientModule } from '@angular/common/http';
import { MockComponent } from '../../test/mock-component';
import { StoreModule } from '@ngrx/store';
import { mapFeatureKey, MapReducer } from '../../reducers/map.reducer';
import { EntryComponentDirective } from '../../directives/entry-component.directive';
import { ENTRY_COMPONENTS_PROVIDER } from '../../models/entry-components-provider';

describe('ImageryContainerComponent', () => {
	let component: ImageryContainerComponent;
	let fixture: ComponentFixture<ImageryContainerComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			imports: [
				HttpClientModule,
				StoreModule.forRoot({ [mapFeatureKey]: MapReducer })
			],
			providers: [
				{ provide: mapFacadeConfig, useValue: <IMapFacadeConfig>{ mapSearch: {} } },
				{ provide: ENTRY_COMPONENTS_PROVIDER, useValue: [] },
			],
			declarations: [
				ImageryContainerComponent,
				EntryComponentDirective,
				MockComponent({
					selector: 'ansyn-imagery-status',
					inputs: ['mapId'],
					outputs: ['onMove', 'toggleMapSynchronization']
				}),
				MockComponent({
					selector: 'ansyn-imagery-view',
					inputs: ['settings']
				}),
				MockComponent({
					selector: 'ansyn-floating-menu',
					inputs: ['mapState']
				}),
				MockComponent({
					selector: 'ansyn-annotations-context-menu', inputs: ['mapId', 'interactionType']
				}),
				MockComponent({
					selector: 'ansyn-imagery-loader', inputs: ['mapId']
				}),
				MockComponent({
					selector: 'ansyn-imagery-tile-progress', inputs: ['mapId', 'lowered']
				}),
				MockComponent({
					selector: 'ansyn-overlay-source-type-notice', inputs: ['overlay']
				}),
				MockComponent({
					selector: 'ansyn-map-search-box', inputs: ['mapId']
				}),
				MockComponent({
					selector: 'ansyn-sentinel-combo-box', inputs: ['mapId']
				}),
				MockComponent({
					selector: 'ansyn-imagery-mouse-coordinates',
					inputs: ['mapId', 'isVisible']
				}),
			]
		}).compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(ImageryContainerComponent);
		component = fixture.componentInstance;
		component.mapState = { data: {} } as any;
		fixture.detectChanges();
	});

	it('should be created', () => {
		expect(component).toBeTruthy();
	});
});
