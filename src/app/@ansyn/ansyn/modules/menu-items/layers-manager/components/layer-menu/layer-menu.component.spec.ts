import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LayerMenuComponent } from './layer-menu.component';

describe('LayerMenuComponent', () => {
	let component: LayerMenuComponent;
	let fixture: ComponentFixture<LayerMenuComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [LayerMenuComponent]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(LayerMenuComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
