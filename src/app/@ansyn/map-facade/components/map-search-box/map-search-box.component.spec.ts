import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MapSearchBoxComponent } from './map-search-box.component';

fdescribe('MapSearchBoxComponent', () => {
	let component: MapSearchBoxComponent;
	let fixture: ComponentFixture<MapSearchBoxComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [MapSearchBoxComponent]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(MapSearchBoxComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
