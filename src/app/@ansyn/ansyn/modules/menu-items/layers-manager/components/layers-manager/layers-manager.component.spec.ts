import { async, ComponentFixture, inject, TestBed } from '@angular/core/testing';
import { LayersManagerComponent } from './layers-manager.component';
import { Store, StoreModule } from '@ngrx/store';
import { layersFeatureKey, LayersReducer } from '../../reducers/layers.reducer';
import { of } from 'rxjs';

describe('LayersManagerComponent', () => {
	let component: LayersManagerComponent;
	let fixture: ComponentFixture<LayersManagerComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			imports: [
				StoreModule.forRoot({
					[layersFeatureKey]: LayersReducer
				})
			],
			providers: []
		})
			.compileComponents();
	}));

	beforeEach(inject([Store], (_store: Store<any>) => {
		spyOn(_store, 'pipe').and.returnValue(of([]));
		fixture = TestBed.createComponent(LayersManagerComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	}));

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
