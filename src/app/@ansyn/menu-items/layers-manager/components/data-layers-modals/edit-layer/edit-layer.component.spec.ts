import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditLayerComponent } from './edit-layer.component';
import { FormsModule } from '@angular/forms';
import { DataLayersService } from '../../../services/data-layers.service';
import { HttpClientModule } from '@angular/common/http';
import { StoreModule } from '@ngrx/store';
import { layersFeatureKey, LayersReducer } from '../../../reducers/layers.reducer';

describe('EditLayerComponent', () => {
	let component: EditLayerComponent;
	let fixture: ComponentFixture<EditLayerComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			imports: [FormsModule, HttpClientModule, StoreModule.forRoot({ [layersFeatureKey]: LayersReducer })],
			providers: [DataLayersService],
			declarations: [EditLayerComponent]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(EditLayerComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
