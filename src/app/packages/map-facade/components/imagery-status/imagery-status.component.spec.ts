import { async, ComponentFixture, inject, TestBed } from '@angular/core/testing';

import { ImageryStatusComponent } from './imagery-status.component';
import { Store, StoreModule } from '@ngrx/store';
import { CoreModule } from '@ansyn/core';

describe('ImageryStatusComponent', () => {
	let component: ImageryStatusComponent;
	let fixture: ComponentFixture<ImageryStatusComponent>;
	let store: Store<any>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			imports: [CoreModule, StoreModule.provideStore({})],
			declarations: [ ImageryStatusComponent ]
		})
			.compileComponents();
	}));

	beforeEach(inject([Store], (_store: Store<any>) => {
		fixture = TestBed.createComponent(ImageryStatusComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
		store = _store;
	}));

	it('should be created', () => {
		expect(component).toBeTruthy();
	});
});
