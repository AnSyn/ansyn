import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ImageryDimentionsModeComponent } from './imagery-dimention-mode.component';

describe('ImageryDimensionModeComponent', () => {
	let component: ImageryDimentionsModeComponent;
	let fixture: ComponentFixture<ImageryDimentionsModeComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [ImageryDimentionsModeComponent]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(ImageryDimentionsModeComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
