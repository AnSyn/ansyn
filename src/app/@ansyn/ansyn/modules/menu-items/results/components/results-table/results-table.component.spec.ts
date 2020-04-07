import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ResultsTableComponent } from './results-table.component';
import { TranslateModule } from "@ngx-translate/core";
import { StoreModule } from "@ngrx/store";
import { StatusBarConfig } from "../../../../status-bar/models/statusBar.config";

describe('ResultsTableComponent', () => {
	let component: ResultsTableComponent;
	let fixture: ComponentFixture<ResultsTableComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			imports: [TranslateModule.forRoot(), StoreModule.forRoot({})],
			declarations: [ResultsTableComponent],
			providers: [{
				provide: StatusBarConfig,
				useValue: { toolTips: {} }
			}]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(ResultsTableComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
