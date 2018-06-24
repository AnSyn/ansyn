import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ImageryContainerComponent } from './imagery-container.component';
import { MockComponent } from '@ansyn/core/test/mock-component';
import { CoreModule } from '@ansyn/core/core.module';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { LoggerConfig } from '@ansyn/core/models/logger.config';
import { mapFeatureKey, MapReducer } from '@ansyn/map-facade/reducers/map.reducer';
import { CoreConfig } from '@ansyn/core/models/core.config';
import { ICoreConfig } from '@ansyn/core/models/core.config.model';

describe('ImageryContainerComponent', () => {
	let component: ImageryContainerComponent;
	let fixture: ComponentFixture<ImageryContainerComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			imports: [
				CoreModule,
				StoreModule.forRoot({ [mapFeatureKey]: MapReducer }),
				EffectsModule.forRoot([])
			],
			providers: [
				{ provide: LoggerConfig, useValue: {} },
				{ provide: CoreConfig, useValue: <ICoreConfig> { mapSearch: {} } }
			],
			declarations: [
				ImageryContainerComponent,
				MockComponent({
					selector: 'ansyn-imagery-view',
					inputs: ['mapComponentSettings']
				}),
				MockComponent({
					selector: 'ansyn-imagery-rotation',
					inputs: ['mapState']
				}),
				MockComponent({
					selector: 'ansyn-annotations-context-menu', inputs: ['mapId']
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
				})
			]
		}).compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(ImageryContainerComponent);
		component = fixture.componentInstance;
		component.mapState = {data: {}} as any;
		fixture.detectChanges();
	});

	it('should be created', () => {
		expect(component).toBeTruthy();
	});
});
