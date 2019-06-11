import { Observable } from 'rxjs';
import { LayoutKey } from '../models/maps-layout';

export function mapsToJpg(maps: ImageData[], layout: LayoutKey): Observable<Blob> {
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


function getSizeByLayout(layout: LayoutKey, maps: Array<ImageData>) {
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

function putImagesOnCanvas(ctx: CanvasRenderingContext2D, maps: ImageData[], layout: LayoutKey) {
	switch (layout) {
		case 'layout1':
			ctx.putImageData(maps[0], 0, 0);
			break;
		case 'layout2':
			ctx.putImageData(maps[0], 0, 0);
			ctx.putImageData(maps[1], maps[0].width, 0);
			break;
		case 'layout3':
			ctx.putImageData(maps[0], 0, 0);
			ctx.putImageData(maps[1], 0, maps[0].height);
			break;
		case 'layout4':
			ctx.putImageData(maps[0], 0, 0);
			ctx.putImageData(maps[1], maps[0].width, 0);
			ctx.putImageData(maps[2], maps[0].width, maps[1].height);
			break;
		case 'layout5':
			ctx.putImageData(maps[0], 0, 0);
			ctx.putImageData(maps[1], 0, maps[0].height);
			ctx.putImageData(maps[2], maps[1].width, maps[0].height);
			break;
		case 'layout6':
			ctx.putImageData(maps[0], 0, 0);
			ctx.putImageData(maps[1], maps[0].width, 0);
			ctx.putImageData(maps[2], 0, maps[0].height);
			ctx.putImageData(maps[3], maps[2].width, maps[1].height);
			break;
	}
}
