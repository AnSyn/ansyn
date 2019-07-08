import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ImageryDimensionModeComponent } from './imagery-dimension-mode.component';
import { StoreModule } from '@ngrx/store';
import { ImageryCommunicatorService } from '@ansyn/imagery';
import { CoreConfig } from '../../../core/models/core.config';

describe('ImageryDimensionModeComponent', () => {
	let component: ImageryDimensionModeComponent;
	let fixture: ComponentFixture<ImageryDimensionModeComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [ImageryDimensionModeComponent],
			imports: [StoreModule.forRoot({})],
			providers: [
				ImageryCommunicatorService,
				{ provide: CoreConfig, useValue: {} }
			]
		}).compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(ImageryDimensionModeComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
