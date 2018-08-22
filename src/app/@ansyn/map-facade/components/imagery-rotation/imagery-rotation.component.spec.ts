import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { StoreModule } from '@ngrx/store';
import { ImageryRotationComponent } from './imagery-rotation.component';
import { CoreModule } from '@ansyn/core/core.module';
import { EffectsModule } from '@ngrx/effects';
import { LoggerConfig } from '@ansyn/core/models/logger.config';
import { ImageryCommunicatorService } from '@ansyn/imagery/communicator-service/communicator.service';
import { HttpClientModule } from '@angular/common/http';
import { CoreConfig } from '@ansyn/core/models/core.config';

describe('ImageryRotationComponent', () => {
	let component: ImageryRotationComponent;
	let fixture: ComponentFixture<ImageryRotationComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			imports: [
				HttpClientModule,
				CoreModule,
				StoreModule.forRoot({}),
				EffectsModule.forRoot([])
			],
			providers: [{ provide: LoggerConfig, useValue: {} }, ImageryCommunicatorService, { provide: CoreConfig, useValue: {} } ],
			declarations: [
				ImageryRotationComponent
			]
		}).compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(ImageryRotationComponent);
		component = fixture.componentInstance;
		component.mapState = {
			data: {
				position: {
					projectedState: {
						rotation: 0
					}
				}
			}
		} as any;
		fixture.detectChanges();
	});

	it('should be created', () => {
		expect(component).toBeTruthy();
	});
});
