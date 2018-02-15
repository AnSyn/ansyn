import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ImageryLoaderComponent } from './imagery-loader.component';

describe('ImageryLoaderComponent', () => {
	let component: ImageryLoaderComponent;
	let fixture: ComponentFixture<ImageryLoaderComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [ImageryLoaderComponent]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(ImageryLoaderComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
