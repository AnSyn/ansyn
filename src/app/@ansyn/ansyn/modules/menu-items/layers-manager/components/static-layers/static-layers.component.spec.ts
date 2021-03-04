import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StaticLayersComponent } from './static-layers.component';

describe('StaticLayersComponent', () => {
	let component: StaticLayersComponent;
	let fixture: ComponentFixture<StaticLayersComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [StaticLayersComponent]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(StaticLayersComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
