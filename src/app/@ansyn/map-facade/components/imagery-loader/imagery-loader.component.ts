import { Component, HostBinding, Input, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { mapStateSelector, IMapState } from '../../reducers/map.reducer';
import { Observable } from 'rxjs/Observable';

@Component({
	selector: 'ansyn-imagery-loader',
	templateUrl: './imagery-loader.component.html',
	styleUrls: ['./imagery-loader.component.less']
})
export class ImageryLoaderComponent implements OnInit {
	@Input() mapId;
	loaderText;

	@HostBinding('class.show')
	get show() {
		return typeof this.loaderText === 'string';
	}

	loaderText$: Observable<string> = this.store$.select(mapStateSelector)
		.pluck<IMapState, Map<string, string>>('mapsIsLoading')
		.distinctUntilChanged()
		.map((mapsIsLoading: Map<string, string>): string => mapsIsLoading.get(this.mapId))
		.do((loaderText) => this.loaderText = loaderText);

	constructor(public store$: Store<IMapState>) {
	}

	ngOnInit() {
		this.loaderText$.subscribe();
	}

}
