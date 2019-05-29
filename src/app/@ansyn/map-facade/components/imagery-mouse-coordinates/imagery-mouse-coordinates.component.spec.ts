import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ImageryMouseCoordinatesComponent } from './imagery-mouse-coordinates.component';

describe('ImageryMouseCoordinatesComponent.Component', () => {
	let component: ImageryMouseCoordinatesComponent;
	let fixture: ComponentFixture<ImageryMouseCoordinatesComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [ImageryMouseCoordinatesComponent]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(ImageryMouseCoordinatesComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
