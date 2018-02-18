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
	private _isLoading;

	@HostBinding('class.show')
	get isLoading() {
		return this._isLoading;
	}

	set isLoading(value: boolean) {
		this._isLoading = value;
	}

	isLoading$: Observable<boolean> = this.store$.select(mapStateSelector)
		.pluck<IMapState, Set<string>>('mapsIsLoading')
		.distinctUntilChanged()
		.map((mapsIsLoading: Set<string>): boolean => mapsIsLoading.has(this.mapId));

	constructor(public store$: Store<IMapState>) {
	}

	ngOnInit() {
		this.isLoading$.subscribe((isLoading) => this.isLoading = isLoading);
	}

}
