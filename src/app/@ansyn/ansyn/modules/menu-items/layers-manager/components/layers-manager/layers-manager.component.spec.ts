import { async, ComponentFixture, inject, TestBed } from '@angular/core/testing';
import { LayersManagerComponent } from './layers-manager.component';
import { Store, StoreModule } from '@ngrx/store';
import { layersFeatureKey, LayersReducer } from '../../reducers/layers.reducer';
import { of } from 'rxjs';
import { MockComponent } from '../../../../core/test/mock-component';
import { MockPipe } from '../../../../core/test/mock-pipe';

describe('LayersManagerComponent', () => {
	let component: LayersManagerComponent;
	let fixture: ComponentFixture<LayersManagerComponent>;
	const mockModals = MockComponent({ selector: 'ansyn-data-layers-modals', inputs: [] });
	const mockCollection = MockComponent({ selector: 'ansyn-layer-collection', inputs: ['collection'] });
	const mockTranslatePipe = MockPipe('translate');

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			imports: [
				StoreModule.forRoot({
					[layersFeatureKey]: LayersReducer
				})
			],
			declarations: [
				LayersManagerComponent,
				mockModals,
				mockCollection,
				mockTranslatePipe
			]
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
