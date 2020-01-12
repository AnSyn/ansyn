import { Component, Input } from '@angular/core';
import { ILayer } from '../../../models/layers.model';
import { CloseLayersModal, RemoveLayer } from '../../../actions/layers.actions';
import { Store } from '@ngrx/store';
import { ILayerState } from '../../../reducers/layers.reducer';

@Component({
	selector: 'ansyn-delete-layer',
	templateUrl: './delete-layer.component.html',
	styleUrls: ['./delete-layer.component.less']
})
export class DeleteLayerComponent {
	@Input() layer: ILayer;

	removeLayer() {
		this.store.dispatch(RemoveLayer({payload: this.layer.id}));
		this.closeModal();
	}

	closeModal() {
		this.store.dispatch(CloseLayersModal());
	}

	constructor(protected store: Store<ILayerState>) {
	}

}
