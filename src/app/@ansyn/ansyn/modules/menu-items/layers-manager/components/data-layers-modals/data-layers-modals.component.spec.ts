import { ComponentFixture, inject, TestBed, waitForAsync } from '@angular/core/testing';

import { DataLayersModalsComponent } from './data-layers-modals.component';
import { Store, StoreModule } from '@ngrx/store';
import { layersFeatureKey, LayersReducer } from '../../reducers/layers.reducer';
import { DownloadLayersComponent } from './download-layers/download-layers.component';
import { EditLayerComponent } from './edit-layer/edit-layer.component';
import { DeleteLayerComponent } from './delete-layer/delete-layer.component';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { AnsynModalComponent } from '../../../../core/components/ansyn-modal/ansyn-modal.component';
import { AnsynInputComponent } from '../../../../core/forms/ansyn-input/ansyn-input.component';
import { TranslateModule } from '@ngx-translate/core';

describe('DataLayersModalsComponent', () => {
	let component: DataLayersModalsComponent;
	let fixture: ComponentFixture<DataLayersModalsComponent>;
	let store: Store<any>;

	beforeEach(waitForAsync(() => {
		TestBed.configureTestingModule({
			declarations: [DataLayersModalsComponent, AnsynModalComponent, DownloadLayersComponent, EditLayerComponent, DeleteLayerComponent, AnsynInputComponent],
			imports: [MatInputModule, MatFormFieldModule, FormsModule, StoreModule.forRoot({ [layersFeatureKey]: LayersReducer }), TranslateModule.forRoot()]
		})
			.compileComponents();
	}));

	beforeEach(inject([Store], (_store: Store<any>) => {
		store = _store;
		spyOn(_store, 'select').and.returnValue(null);
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
