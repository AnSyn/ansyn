import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FourViewsFilterComponent } from './four-views-filter.component';
import { StoreModule } from '@ngrx/store';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { fourViewsConfig } from '../../overlays/models/overlay.model';

describe('FourViewsFilterComponent', () => {
	let component: FourViewsFilterComponent;
	let fixture: ComponentFixture<FourViewsFilterComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [FourViewsFilterComponent],
			providers: [
				TranslateService,
				{
					provide: fourViewsConfig,
					useValue: {
						sensors: []
					}
				}
			],
			imports: [StoreModule.forRoot({}), TranslateModule.forRoot({})]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(FourViewsFilterComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
