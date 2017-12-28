import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { StoreModule } from '@ngrx/store';
import { ImageryRotationComponent } from './imagery-rotation.component';
import { CoreModule } from '@ansyn/core/core.module';
import { EffectsModule } from '@ngrx/effects';
import { EventEmitter } from '@angular/core';
import { MapEffects } from '../../effects/map.effects';
import { LoggerConfig } from '@ansyn/core/models/logger.config';

describe('ImageryRotationComponent', () => {
	let component: ImageryRotationComponent;
	let fixture: ComponentFixture<ImageryRotationComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			imports: [
				CoreModule,
				StoreModule.forRoot({}),
				EffectsModule.forRoot([])
			],
			providers: [{ provide: LoggerConfig, useValue: {} }],
			declarations: [
				ImageryRotationComponent
			],
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
