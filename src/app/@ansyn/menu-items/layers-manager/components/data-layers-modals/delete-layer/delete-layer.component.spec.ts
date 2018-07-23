import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteLayerComponent } from './delete-layer.component';

describe('DeleteLayerComponent', () => {
	let component: DeleteLayerComponent;
	let fixture: ComponentFixture<DeleteLayerComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [DeleteLayerComponent]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(DeleteLayerComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
