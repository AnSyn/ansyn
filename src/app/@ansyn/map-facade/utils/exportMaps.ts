import { Observable } from 'rxjs';
import { LayoutKey } from '../models/maps-layout';

export function mapsToJpg(maps: HTMLImageElement[], layout: LayoutKey): Observable<Blob> {
	let c = document.createElement('canvas');
	let size = getSizeByLayout(layout, maps);
	c.width = size.width;
	c.height = size.height;
	const ctx = c.getContext('2d');
	ctx.clearRect(0, 0, size.width, size.height);
	putImagesOnCanvas(ctx, maps, layout);

	return new Observable(observer => {
		c.toBlob(result => {
			observer.next(result);
			observer.complete()
		});
	});
}


function getSizeByLayout(layout: LayoutKey, maps: HTMLImageElement[]) {
	const size = { width: 0, height: 0 }
	switch (layout) {
		case 'layout1':
			size.width = maps[0].width;
			size.height = maps[0].height;
			return size;
		case 'layout2':
			size.width = maps[0].width + maps[1].width;
			size.height = maps[0].height;
			return size;
		case 'layout3':
			size.width = maps[0].width;
			size.height = maps[0].height + maps[1].height;
			return size;
		case 'layout4':
			size.width = maps[0].width + maps[1].width;
			size.height = maps[0].height;
			return size;
		case 'layout5':
			size.width = maps[0].width;
			size.height = maps[0].height + +maps[1].height;
			return size;
		case 'layout6':
			size.width = maps[0].width + maps[1].width;
			size.height = maps[0].height + +maps[2].height;
			return size;
	}
}

function putImagesOnCanvas(ctx: CanvasRenderingContext2D, maps: HTMLImageElement[], layout: LayoutKey) {
	switch (layout) {
		case 'layout1':
			ctx.drawImage(maps[0], 0, 0, maps[0].width, maps[0].height);
			break;
		case 'layout2':
			ctx.drawImage(maps[0], 0, 0, maps[0].width, maps[0].height);
			ctx.drawImage(maps[1], maps[0].width, 0, maps[1].width, maps[1].height);
			break;
		case 'layout3':
			ctx.drawImage(maps[0], 0, 0, maps[0].width, maps[0].height);
			ctx.drawImage(maps[1], 0, maps[0].height, maps[1].width, maps[1].height);
			break;
		case 'layout4':
			ctx.drawImage(maps[0], 0, 0, maps[0].width, maps[0].height);
			ctx.drawImage(maps[1], maps[0].width, 0, maps[1].width, maps[1].height);
			ctx.drawImage(maps[2], maps[0].width, maps[1].height, maps[2].width, maps[2].height);
			break;
		case 'layout5':
			ctx.drawImage(maps[0], 0, 0, maps[0].width, maps[0].height);
			ctx.drawImage(maps[1], 0, maps[0].height, maps[1].width, maps[1].height);
			ctx.drawImage(maps[2], maps[1].width, maps[0].height, maps[2].width, maps[2].height);
			break;
		case 'layout6':
			ctx.drawImage(maps[0], 0, 0, maps[0].width, maps[0].height);
			ctx.drawImage(maps[1], maps[0].width, 0, maps[1].width, maps[1].height);
			ctx.drawImage(maps[2], 0, maps[0].height, maps[2].width, maps[2].height);
			ctx.drawImage(maps[3], maps[2].width, maps[1].height, maps[3].width, maps[3].height);
			break;
	}
}
