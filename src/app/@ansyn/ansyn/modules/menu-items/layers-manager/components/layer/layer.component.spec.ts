import { async, ComponentFixture, inject, TestBed } from '@angular/core/testing';
import { LayerComponent } from './layer.component';
import { Store, StoreModule } from '@ngrx/store';
import { SelectOnlyLayer } from '../../actions/layers.actions';
import { FormsModule } from '@angular/forms';
import { AnsynCheckboxComponent } from '../../../../core/forms/ansyn-checkbox/ansyn-checkbox.component';

describe('LayerComponent', () => {
	let component: LayerComponent;
	let fixture: ComponentFixture<LayerComponent>;
	let store: Store<any>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [LayerComponent, AnsynCheckboxComponent],
			imports: [StoreModule.forRoot({}), FormsModule]
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
		component.layer = <any> { id: 'layerId' };
		component.selectOnly();
		expect(store.dispatch).toHaveBeenCalledWith(new SelectOnlyLayer('layerId'));
	});
});
