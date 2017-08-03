import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GeoComponent } from './geo.component';
import { FormsModule } from '@angular/forms';

describe('GeoComponent', () => {
	let component: GeoComponent;
	let fixture: ComponentFixture<GeoComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [ GeoComponent ],
			imports: [FormsModule]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(GeoComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should be created', () => {
		expect(component).toBeTruthy();
	});

	it('onInputs should call onChanges with copy values', () => {
		spyOn(component, 'onChanges');
		component.onInputs(component.coordinates);
		expect(component.onChanges).toHaveBeenCalledWith(component.coordinates);
	});

});
