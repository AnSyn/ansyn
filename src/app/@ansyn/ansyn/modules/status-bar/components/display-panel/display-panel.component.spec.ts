import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DisplayPanelComponent } from './display-panel.component';
import { TranslateModule } from '@ngx-translate/core';

describe('DisplayPanelComponent', () => {
	let component: DisplayPanelComponent;
	let fixture: ComponentFixture<DisplayPanelComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [DisplayPanelComponent],
			imports: [TranslateModule.forRoot()]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(DisplayPanelComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
