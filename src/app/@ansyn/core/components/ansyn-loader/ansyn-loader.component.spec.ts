import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AnsynLoaderComponent } from './ansyn-loader.component';

describe('ImageryLoaderComponent', () => {
	let component: AnsynLoaderComponent;
	let fixture: ComponentFixture<AnsynLoaderComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [AnsynLoaderComponent]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(AnsynLoaderComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	describe('isLoading should show/hide host element', () => {
		it('show', () => {
			component.show = true;
			fixture.detectChanges();
			expect(fixture.debugElement.classes.show).toBeTruthy();
		});
		it('hide', () => {
			component.show = false;
			fixture.detectChanges();
			expect(fixture.debugElement.classes.show).toBeFalsy();
		});
	});

});
