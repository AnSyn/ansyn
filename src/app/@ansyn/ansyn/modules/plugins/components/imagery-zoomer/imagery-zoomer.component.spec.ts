import { async, ComponentFixture, inject, TestBed } from '@angular/core/testing';

import { ImageryZoomerComponent } from './imagery-zoomer.component';
import { of } from 'rxjs';
import { ImageryCommunicatorService } from '@ansyn/imagery';
import { TranslateModule } from '@ngx-translate/core';

describe('ImageryZoomerComponent', () => {
	let component: ImageryZoomerComponent;
	let fixture: ComponentFixture<ImageryZoomerComponent>;
	let imageryCommunicatorService: ImageryCommunicatorService;

	let imageryCommunicatorServiceMock = {
		provide: () => ({
			ActiveMap: () => of({
				getResolution: () => {
				},
				setResolution: () => {
				}
			})
		})
	};
	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [ImageryZoomerComponent],
			imports: [TranslateModule.forRoot()],
			providers: [
				{
					provide: ImageryCommunicatorService,
					useValue: imageryCommunicatorServiceMock
				}
			]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(ImageryZoomerComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	beforeEach(inject([ImageryCommunicatorService], (_imageryCommunicatorService: ImageryCommunicatorService) => {
		imageryCommunicatorService = _imageryCommunicatorService;
	}));

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
