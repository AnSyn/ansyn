import { async, ComponentFixture, inject, TestBed } from '@angular/core/testing';

import { HelpComponent } from './help.component';
import { Store, StoreModule } from '@ngrx/store';
import { menuFeatureKey, MenuReducer } from '@ansyn/menu';
import { ICoreState } from '@ansyn/core/reducers/core.reducer';
import { AnsynCheckboxComponent, CoreModule } from '@ansyn/core';
import { By } from '@angular/platform-browser';
import { CarouselModule } from 'ngx-bootstrap/carousel';
import { EffectsModule } from '@ngrx/effects';

describe('HelpComponent', () => {
	let component: HelpComponent;
	let fixture: ComponentFixture<HelpComponent>;
	let store: Store<any>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			imports: [
				StoreModule.forRoot({[menuFeatureKey]: MenuReducer}),
				EffectsModule.forRoot([]),
				CarouselModule.forRoot(),
				CoreModule
			],
			declarations: [HelpComponent]
		})
			.compileComponents();
	}));

	beforeEach(inject([Store], (_store: Store<ICoreState>) => {
		store = _store;
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(HelpComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	describe('checkbox click event', () => {
		it('should invoke a call to the store', () => {
			let checkboxElement = fixture.debugElement.query(By.directive(AnsynCheckboxComponent));
			spyOn(store, 'dispatch');
			checkboxElement.triggerEventHandler('inputClicked', {data: { isChecked: true }});
			expect(store.dispatch).toHaveBeenCalled();
		});
	});
});
