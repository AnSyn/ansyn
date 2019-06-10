import { Observable, EMPTY } from 'rxjs';
import { LayoutKey } from '../models/maps-layout';

export function mapsToJpg(maps: ImageData[], layout: LayoutKey): Observable<any> {
	let c = document.createElement('canvas');
	let ctx;
	let cW, cH;
	switch (layout) {
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
			return EMPTY;
	}

	return new Observable(observer => {
		c.toBlob(result => {
			observer.next(result);
			observer.complete()
		});
	});
}
