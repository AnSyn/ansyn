import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ImageryVideoComponent } from './imagery-video.component';

xdescribe('ImageryVideoComponent', () => {
	let component: ImageryVideoComponent;
	let fixture: ComponentFixture<ImageryVideoComponent>;

	beforeEach(waitForAsync(() => {
		TestBed.configureTestingModule({
			declarations: [ImageryVideoComponent]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(ImageryVideoComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
