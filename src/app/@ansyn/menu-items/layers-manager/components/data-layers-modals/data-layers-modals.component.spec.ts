import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DataLayersModalsComponent } from './data-layers-modals.component';
import { StoreModule } from '@ngrx/store';
import { layersFeatureKey, LayersReducer } from '../../reducers/layers.reducer';
import { AnsynModalComponent } from '../../../../core/components/ansyn-modal/ansyn-modal.component';

describe('DataLayersModalsComponent', () => {
	let component: DataLayersModalsComponent;
	let fixture: ComponentFixture<DataLayersModalsComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [DataLayersModalsComponent, AnsynModalComponent],
			imports: [StoreModule.forRoot({ [layersFeatureKey]: LayersReducer })]
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
