import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { StoreModule } from '@ngrx/store';
import { TranslateModule } from '@ngx-translate/core';

import { SearchOptionsComponent } from './search-options.component';

	describe('SearchOptionsComponent', () => {
		let component: SearchOptionsComponent;
		let fixture: ComponentFixture<SearchOptionsComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
		declarations: [ SearchOptionsComponent ],
		imports: [StoreModule.forRoot({}),
				TranslateModule.forRoot()]

		})
		.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(SearchOptionsComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
