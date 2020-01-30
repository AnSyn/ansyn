import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ImageryVideoComponent } from './imagery-video.component';
import { AnimatedEllipsisComponent } from '@ansyn/map-facade';

xdescribe('ImageryVideoComponent', () => {
	let component: ImageryVideoComponent;
	let fixture: ComponentFixture<ImageryVideoComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [ImageryVideoComponent, AnimatedEllipsisComponent]
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
