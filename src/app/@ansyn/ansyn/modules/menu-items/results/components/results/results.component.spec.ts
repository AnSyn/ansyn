import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ResultsComponent } from './results.component';
import { MockComponent } from "../../../../core/test/mock-component";
import { StatusBarConfig } from "../../../../status-bar/models/statusBar.config";
import { TranslateModule } from "@ngx-translate/core";
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { StoreModule } from '@ngrx/store';

describe('ResultsComponent', () => {
	let component: ResultsComponent;
	let fixture: ComponentFixture<ResultsComponent>;
	let a = MockComponent({ selector: 'ansyn-results-table' });
	let b = MockComponent({ selector: 'ansyn-results-table-header' });

	beforeEach(waitForAsync(() => {
		TestBed.configureTestingModule({
			imports: [TranslateModule.forRoot(), BrowserAnimationsModule, StoreModule.forRoot({})],
			declarations: [ResultsComponent, a, b],
			providers: [{
				provide: StatusBarConfig,
				useValue: { toolTips: {} }
			}]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(ResultsComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
