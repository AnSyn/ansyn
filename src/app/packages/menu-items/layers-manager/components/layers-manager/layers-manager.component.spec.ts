import { async, ComponentFixture, inject, TestBed } from '@angular/core/testing';
import { LayersManagerModule } from '../../layers-manager.module';
import { LayersManagerComponent } from './layers-manager.component';
import { HttpModule } from '@angular/http';
import { StoreModule } from '@ngrx/store';
import { LayersReducer } from '../../reducers/layers.reducer';

describe('LayersManagerComponent', () => {
	let component: LayersManagerComponent;
	let fixture: ComponentFixture<LayersManagerComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			imports: [LayersManagerModule, HttpModule, StoreModule.provideStore({ layers: LayersReducer })],
		})
			.compileComponents();
	}));

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
