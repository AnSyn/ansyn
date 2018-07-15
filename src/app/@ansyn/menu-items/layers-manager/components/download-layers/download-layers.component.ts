import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { selectAnnotationLayer } from '@ansyn/menu-items/tools/reducers/tools.reducer';
import { Observable } from 'rxjs/index';
import { select, Store } from '@ngrx/store';
import { take, tap } from 'rxjs/internal/operators';
import { saveAs } from 'file-saver';
import * as tokml from 'tokml';

@Component({
	selector: 'ansyn-download-layers',
	templateUrl: './download-layers.component.html',
	styleUrls: ['./download-layers.component.less']
})
export class DownloadLayersComponent implements OnInit {
	@Output() onFinish = new EventEmitter();
	annotationsLayer$: Observable<any> = this.store.pipe(select(selectAnnotationLayer));

	constructor(protected store: Store<any>) {
	}

	downloadGeojson() {
		this.annotationsLayer$
			.pipe(
				take(1),
				tap((annotationsLayer) => {
					const blob = new Blob([JSON.stringify(annotationsLayer)], { type: 'application/json' });
					saveAs(blob, 'annotations.json');
					this.onFinish.emit();
				})
			)
			.subscribe();
	}

	downloadKml() {
		this.annotationsLayer$
			.pipe(
				take(1),
				tap((annotationsLayer) => {
					const blob = new Blob([tokml(this.visualizerToSimpleStyle(annotationsLayer), { simplestyle: true })], { type: 'application/vnd.google-earth.kml+xml' });
					saveAs(blob, 'annotations.kml');
					this.onFinish.emit();
				})
			)
			.subscribe();

	}

	visualizerToSimpleStyle(annotationsLayer) {
		annotationsLayer.features.forEach((feature) => {
			feature.properties = {
				"marker-size": "medium",
				"marker-symbol": "bus",
				"marker-color": "#ace"
			};
			// Object.entries(feature.properties).forEach(([key, value]) => {
			// 	if (key === 'stroke') {
			//
			// 	}
			// });
		});
		return { ...annotationsLayer }
	}

	ngOnInit() {
		console.log(tokml );
	}

}
