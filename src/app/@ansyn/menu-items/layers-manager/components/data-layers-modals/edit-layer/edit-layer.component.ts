import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { ILayer } from '../../../models/layers.model';
import { Store } from '@ngrx/store';
import { ILayerState } from '../../../reducers/layers.reducer';
import { AddLayer, CloseLayersModal, UpdateLayer } from '../../../actions/layers.actions';
import { DataLayersService } from '../../../services/data-layers.service';

@Component({
	selector: 'ansyn-edit-layer',
	templateUrl: './edit-layer.component.html',
	styleUrls: ['./edit-layer.component.less']
})
export class EditLayerComponent {
	@Input() layer: ILayer;

	@ViewChild('layerName')
	set layerName(layerName: ElementRef) {
		if (layerName) {
			setTimeout(() => {
				layerName.nativeElement.select();
			}, 100);
		}
	}

	constructor(protected store: Store<ILayerState>, protected dataLayersService: DataLayersService) {
	}

	addLayer(name) {
		const layer = DataLayersService.generateAnnotationLayer(name);
		this.store.dispatch(new AddLayer(layer));
		this.closeModal();
	}

	closeModal() {
		this.store.dispatch(new CloseLayersModal());
	}

	editLayer(name) {
		this.store.dispatch(new UpdateLayer({ ...this.layer, name }));
		this.closeModal();
	}

}
