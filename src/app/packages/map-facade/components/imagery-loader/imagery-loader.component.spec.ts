import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ImageryLoaderComponent } from './imagery-loader.component';
import { StoreModule } from '@ngrx/store';
import { mapFeatureKey, MapReducer, mapStateSelector } from '@ansyn/map-facade';

describe('ImageryLoaderComponent', () => {
	let component: ImageryLoaderComponent;
	let fixture: ComponentFixture<ImageryLoaderComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			imports: [StoreModule.forRoot({ [mapFeatureKey]: MapReducer })],
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

	describe('isLoading should show/hide host element', () => {
		it('show', () => {
			component.isLoading = true;
			fixture.detectChanges();
			expect(fixture.debugElement.classes.show).toBeTruthy();
		});
		it('hide', () => {
			component.isLoading = false;
			fixture.detectChanges();
			expect(fixture.debugElement.classes.show).toBeFalsy();
		});
	});

});
