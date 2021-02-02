import { Component, Input, OnDestroy, OnInit, Inject } from '@angular/core';
import { IEntryComponent, ImageryZoomerService, IMapFacadeConfig, mapFacadeConfig } from '@ansyn/map-facade';
import { Store } from '@ngrx/store';
import { AutoSubscription, AutoSubscriptions } from 'auto-subscriptions';
import { tap } from 'rxjs/operators';
import { selectIsMinimalistViewMode } from '@ansyn/map-facade';

@Component({
	selector: 'ansyn-imagery-zoomer',
	templateUrl: './imagery-zoomer.component.html',
	styleUrls: ['./imagery-zoomer.component.less']
})
@AutoSubscriptions()
export class ImageryZoomerComponent implements OnInit, OnDestroy, IEntryComponent {
	@Input() mapId;
	show: boolean;

	@AutoSubscription
	isMinimalistViewMode$ = this.store$.select(selectIsMinimalistViewMode).pipe(
		tap(isMinimalistViewMode => {
			this.show = !isMinimalistViewMode;
		})
	);

	get showOne2One(): boolean {
		return this.mapFacedeConfig.showOne2One;
	}
	constructor(protected imageryZoomerService: ImageryZoomerService,
				@Inject(mapFacadeConfig) public mapFacedeConfig: IMapFacadeConfig,
				protected store$: Store<any>) {
	}

	ngOnInit() {
	}

	ngOnDestroy(): void {
	}

	getType(): string {
		return '';
	}

	one2one() {
		this.imageryZoomerService.one2one(this.mapId);
	}

	zoomIn() {
		this.imageryZoomerService.zoomIn(this.mapId);
	}

	zoomOut() {
		this.imageryZoomerService.zoomOut(this.mapId);

	}
}
