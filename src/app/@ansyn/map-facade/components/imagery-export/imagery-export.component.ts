import { DOCUMENT } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { ImageryCommunicatorService } from '@ansyn/imagery';
import { saveAs } from 'file-saver';

@Component({
	selector: 'ansyn-imagery-export',
	templateUrl: './imagery-export.component.html',
	styleUrls: ['./imagery-export.component.less']
})
export class ImageryExportComponent implements OnInit {

	constructor(protected imageryCommunicatorService: ImageryCommunicatorService,
				@Inject(DOCUMENT) protected document: Document) {
	}

	ngOnInit() {
	}

	exportMap() {
		const communicators = this.imageryCommunicatorService.communicatorsAsArray();
		const maps = [];
		communicators.forEach(comm => {
			const map = comm.ActiveMap;
			maps.push(map.getExportData());
		});
		const layout = this.getLayout();
		this.buildCanvasForAllMaps(maps, layout);
	}


	private getLayout() {
		const main = this.document.getElementsByClassName('imageries-container')[0];
		return main.classList.item(1);
	}

	private buildCanvasForAllMaps(maps: any[], layout: string) {
		const c = this.document.createElement('canvas');
		let ctx;
		let cW, cH;
		switch (layout) {
			case 'layout1':
				c.width = maps[0].width;
				c.height = maps[0].height;
				ctx = c.getContext('2d');
				ctx.clearRect(0, 0, cW, cH);
				ctx.putImage(maps[0]);
				return;
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
		saveAs(blob, 'map.png');
	}
}
