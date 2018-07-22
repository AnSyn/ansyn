import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DataLayersModalsComponent } from './data-layers-modals.component';

describe('DataLayersModalsComponent', () => {
	let component: DataLayersModalsComponent;
	let fixture: ComponentFixture<DataLayersModalsComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [DataLayersModalsComponent]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(DataLayersModalsComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
