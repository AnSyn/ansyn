import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { IEntryComponent, ImageryZoomerService } from '@ansyn/map-facade';
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
	isInExportMode$ = this.store$.select(selectIsMinimalistViewMode).pipe(
		tap(isInExportMode => {
			this.show = !isInExportMode;
		})
	);

	constructor(protected imageryZoomerService: ImageryZoomerService,
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
