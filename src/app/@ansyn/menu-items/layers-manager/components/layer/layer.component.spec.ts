import { async, ComponentFixture, inject, TestBed } from '@angular/core/testing';

import { LayerComponent } from './layer.component';
import { Store, StoreModule } from '@ngrx/store';
import { UpdateSelectedLayersIds } from '../../actions/layers.actions';

describe('LayerComponent', () => {
	let component: LayerComponent;
	let fixture: ComponentFixture<LayerComponent>;
	let store: Store<any>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [LayerComponent],
			imports: [StoreModule.forRoot({})]
		})
			.compileComponents();
	}));

	beforeEach(inject([Store], (_store: Store<any>) => {
		fixture = TestBed.createComponent(LayerComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
		store = _store;
	}));

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('on selectOnly store should dispatch "UpdateSelectedLayersIds" action with layerId', () => {
		spyOn(store, 'dispatch');
		component.selectOnly('layerId');
		expect(store.dispatch).toHaveBeenCalledWith(new UpdateSelectedLayersIds(['layerId']));
	});
});
