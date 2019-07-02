import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GeoHolderComponent } from './geo-holder.component';

describe('GeoHolderComponent', () => {
	let component: GeoHolderComponent;
	let fixture: ComponentFixture<GeoHolderComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [GeoHolderComponent]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(GeoHolderComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
