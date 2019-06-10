import { DOCUMENT } from '@angular/common';
import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { ImageryCommunicatorService } from '@ansyn/imagery';
import { saveAs } from 'file-saver';
import { AutoSubscriptions, AutoSubscription } from 'auto-subscriptions';
import { Store } from '@ngrx/store';
import { LayoutKey } from '../../models/maps-layout';
import { selectLayout } from '../../reducers/map.reducer';
import { tap } from 'rxjs/operators';

@Component({
	selector: 'ansyn-imagery-export',
	templateUrl: './imagery-export.component.html',
	styleUrls: ['./imagery-export.component.less']
})
@AutoSubscriptions()
export class ImageryExportComponent implements OnInit, OnDestroy {

	layout: LayoutKey;
	@AutoSubscription
	layoutName$ = this.store$.select(selectLayout).pipe(
		tap( (layout: LayoutKey) => this.layout = layout)
	);
	constructor(protected imageryCommunicatorService: ImageryCommunicatorService,
				@Inject(DOCUMENT) protected document: Document,
				protected store$: Store<any>) {
	}

	ngOnInit() {
	}

	ngOnDestroy(): void {
	}

	exportMaps() {
		const communicators = this.imageryCommunicatorService.communicatorsAsArray();
		const maps = [];
		communicators.forEach(comm => {
			const map = comm.ActiveMap;
			maps.push(map.getExportData());
		});
		this.buildCanvasForAllMaps(maps);
	}

	private buildCanvasForAllMaps(maps: any[]) {
		// @TODO: cleaner function
		const c = this.document.createElement('canvas');
		let ctx;
		let cW, cH;
		switch (this.layout) {
			case 'layout1':
				cW = maps[0].width;
				cH = maps[0].height;
				c.width = cW;
				c.height = cH;
				ctx = c.getContext('2d');
				ctx.clearRect(0, 0, cW, cH);
				ctx.putImageData(maps[0], 0, 0);
				break;
			case 'layout2':
				cW = maps[0].width + maps[1].width;
				cH = maps[0].height;
				c.width = cW;
				c.height = cH;
				ctx = c.getContext('2d');
				ctx.clearRect(0, 0, cW, cH);
				ctx.putImageData(maps[0], 0, 0);
				ctx.putImageData(maps[1], maps[0].width, 0);
				break;
			case 'layout3':
				cW = maps[0].width;
				cH = maps[0].height + maps[1].height;
				c.width = cW;
				c.height = cH;
				ctx = c.getContext('2d');
				ctx.clearRect(0, 0, cW, cH);
				ctx.putImageData(maps[0], 0, 0);
				ctx.putImageData(maps[1], 0, maps[0].height);
				break;
			case 'layout4':
				cW = maps[0].width + maps[1].width;
				cH = maps[0].height;
				c.width = cW;
				c.height = cH;
				ctx = c.getContext('2d');
				ctx.clearRect(0, 0, cW, cH);
				ctx.putImageData(maps[0], 0, 0);
				ctx.putImageData(maps[1], maps[0].width, 0);
				ctx.putImageData(maps[2], maps[0].width, maps[1].height);
				break;
			case 'layout5':
				cW = maps[0].width;
				cH = maps[0].height + +maps[1].height;
				c.width = cW;
				c.height = cH;
				ctx = c.getContext('2d');
				ctx.clearRect(0, 0, cW, cH);
				ctx.putImageData(maps[0], 0, 0);
				ctx.putImageData(maps[1], 0, maps[0].height);
				ctx.putImageData(maps[2], maps[1].width, maps[0].height);
				break;
			case 'layout6':
				cW = maps[0].width + maps[1].width;
				cH = maps[0].height + +maps[2].height;
				c.width = cW;
				c.height = cH;
				ctx = c.getContext('2d');
				ctx.clearRect(0, 0, cW, cH);
				ctx.putImageData(maps[0], 0, 0);
				ctx.putImageData(maps[1], maps[0].width, 0);
				ctx.putImageData(maps[2], 0, maps[0].height);
				ctx.putImageData(maps[3], maps[2].width, maps[1].height);
				break;
			default:
				return null;
		}

		c.toBlob(this.save);
	}


	private save(blob: Blob) {
		saveAs(blob, 'map.jpg');
	}
}
