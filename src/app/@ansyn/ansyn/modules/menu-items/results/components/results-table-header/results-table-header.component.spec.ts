import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ResultsTableHeaderComponent } from './results-table-header.component';
import { TranslateModule } from "@ngx-translate/core";
import { StoreModule } from "@ngrx/store";
import { StatusBarConfig } from "../../../../status-bar/models/statusBar.config";
import { EffectsModule } from "@ngrx/effects";

describe('ResultsTableHeaderComponent', () => {
	let component: ResultsTableHeaderComponent;
	let fixture: ComponentFixture<ResultsTableHeaderComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			imports: [TranslateModule.forRoot(), StoreModule.forRoot({}), EffectsModule.forRoot([])],
			declarations: [ResultsTableHeaderComponent],
			providers: [{
				provide: StatusBarConfig,
				useValue: { toolTips: {} }
			}]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(ResultsTableHeaderComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
