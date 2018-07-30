import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DataLayersModalsComponent } from './data-layers-modals.component';
import { StoreModule } from '@ngrx/store';
import { layersFeatureKey, LayersReducer } from '../../reducers/layers.reducer';
import { DownloadLayersComponent } from './download-layers/download-layers.component';
import { EditLayerComponent } from './edit-layer/edit-layer.component';
import { DeleteLayerComponent } from './delete-layer/delete-layer.component';
import { FormsModule } from '@angular/forms';
import { AnsynModalComponent } from '@ansyn/core/components/ansyn-modal/ansyn-modal.component';

describe('DataLayersModalsComponent', () => {
	let component: DataLayersModalsComponent;
	let fixture: ComponentFixture<DataLayersModalsComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [DataLayersModalsComponent, AnsynModalComponent, DownloadLayersComponent, EditLayerComponent, DeleteLayerComponent],
			imports: [FormsModule, StoreModule.forRoot({ [layersFeatureKey]: LayersReducer })]
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
