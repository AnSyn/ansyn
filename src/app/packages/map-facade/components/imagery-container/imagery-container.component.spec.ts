import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ImageryContainerComponent } from './imagery-container.component';
import { MockComponent } from '@ansyn/core/test';
import { CoreModule } from '@ansyn/core/core.module';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { LoggerConfig } from '@ansyn/core/models/logger.config';

describe('ImageryContainerComponent', () => {
	let component: ImageryContainerComponent;
	let fixture: ComponentFixture<ImageryContainerComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			imports: [
				CoreModule,
				StoreModule.forRoot({}),
				EffectsModule.forRoot([])
			],
			providers: [{ provide: LoggerConfig, useValue: {} }],
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
				})
			]
		}).compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(ImageryContainerComponent);
		component = fixture.componentInstance;
		component.mapState = {} as any;
		fixture.detectChanges();
	});

	it('should be created', () => {
		expect(component).toBeTruthy();
	});
});
