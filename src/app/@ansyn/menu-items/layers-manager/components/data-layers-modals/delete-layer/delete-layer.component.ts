import { Component, Input } from '@angular/core';
import { ILayer } from '../../../models/layers.model';
import { CloseLayersModal, RemoveLayer } from '../../../actions/layers.actions';
import { take } from 'rxjs/internal/operators';
import { of } from 'rxjs/index';
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
		of(true).pipe(take(1)).subscribe(() => {
			this.store.dispatch(new RemoveLayer(this.layer.id));
			this.closeModal();
		});
	}

	closeModal() {
		this.store.dispatch(new CloseLayersModal());
	}

	constructor(protected store: Store<ILayerState>) {
	}

}
