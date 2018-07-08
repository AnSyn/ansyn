import {
	ILayerState,
	selectDisplayAnnotationsLayer,
	selectLayers
} from '@ansyn/menu-items/layers-manager/reducers/layers.reducer';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { select, Store } from '@ngrx/store';
import { ILayer } from '@ansyn/menu-items/layers-manager/models/layers.model';
import { ToggleDisplayAnnotationsLayer } from '@ansyn/menu-items/layers-manager/actions/layers.actions';
import { groupBy } from 'lodash';
import { saveAs } from 'file-saver';
import { map } from 'rxjs/internal/operators';
import { selectAnnotationLayer } from '@ansyn/menu-items/tools/reducers/tools.reducer';
import { tap } from 'rxjs/operators';


@Component({
	selector: 'ansyn-layer-managers',
	templateUrl: './layers-manager.component.html',
	styleUrls: ['./layers-manager.component.less']
})

export class LayersManagerComponent implements OnInit, OnDestroy {
	annotationLayerChecked;
	annotationsLayer;
	subscriptions = [];

	public layers$: Observable<any> = this.store
		.pipe(
			select(selectLayers),
			map((layers: ILayer[]) => {
				const typeGroupedLayers = groupBy(layers, l => l.type);
				return Object.keys(typeGroupedLayers).map(layer => typeGroupedLayers[layer]);
			})
		);

	annotationsLayer$: Observable<any> = this.store
		.pipe(
			select(selectAnnotationLayer),
			tap((annotationsLayer) => this.annotationsLayer = annotationsLayer)
		);

	displayAnnotationsLayer$ = this.store
		.pipe(
			select(selectDisplayAnnotationsLayer),
			tap(result => this.annotationLayerChecked = result)
		);

	constructor(protected store: Store<ILayerState>) {
	}

	ngOnInit() {
		this.subscriptions.push(
			this.layers$.subscribe(),
			this.annotationsLayer$.subscribe(),
			this.displayAnnotationsLayer$.subscribe()
		);
	}

	ngOnDestroy() {
		this.subscriptions.forEach((sub) => sub.unsubscribe());
	}

	annotationLayerClick() {
		this.store.dispatch(new ToggleDisplayAnnotationsLayer(!this.annotationLayerChecked));
	}

	downloadAnnotations() {
		const blob = new Blob([JSON.stringify(this.annotationsLayer)], { type: 'application/json' });
		saveAs(blob, 'annotations.json');
	}

}
