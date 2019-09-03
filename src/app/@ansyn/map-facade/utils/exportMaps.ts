import { ICanvasExportData } from '@ansyn/imagery';
import { Observable } from 'rxjs';
import { LayoutKey } from '../models/maps-layout';

export function mapsToPng(maps: ICanvasExportData[], layout: LayoutKey): Observable<Blob> {
	let c = document.createElement('canvas');
	let size = getSizeByLayout(layout, maps);
	c.width = size.width;
	c.height = size.height;
	const ctx = c.getContext('2d');
	ctx.font = '30px Arial';
	ctx.clearRect(0, 0, size.width, size.height);
	return putImagesOnCanvas(ctx, maps, layout);
}


function getSizeByLayout(layout: LayoutKey, maps: ICanvasExportData[]) {
	const size = { width: 0, height: 0 };
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

function createBlobFromDataURL(dataURI: string) {
	let byteString = atob(dataURI.split(',')[1]);
	let mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0]
	let ab = new ArrayBuffer(byteString.length);
	let ia = new Uint8Array(ab);
	for (let i = 0; i < byteString.length; i++) {
		ia[i] = byteString.charCodeAt(i);
	}
	let blob = new Blob([ab], { type: mimeString });
	return blob;
}

function putImagesOnCanvas(ctx: CanvasRenderingContext2D, maps: ICanvasExportData[], layout: LayoutKey): Observable<Blob> {
	const total = maps.length;
	let loaded = 0;
	return new Observable(obs => {
		maps.forEach((map, index, all) => {
			if (map.data !== null) {
				const img = new Image(map.width, map.height);
				img.onload = (event) => {
					drawImage(event.target, index, all);
					loaded++;
					if (loaded === total) {
						done();
					}

					img.onload = null;
				};
				img.src = map.data;
			} else {
				drawImage(map, index, all);
				loaded++;
				if (loaded === total) {
					done();
				}
			}
		});

		function done() {
			if (ctx.canvas.toBlob) {
				ctx.canvas.toBlob(blob => {
					obs.next(blob);
					obs.complete()
				});
			} else {
				obs.next(createBlobFromDataURL(ctx.canvas.toDataURL('image/jpeg', 1.0)));
				obs.complete();
			}
		}
	});

	function drawImage(img, index, allMaps) {
		let x = 0, y = 0, w = allMaps[index].width, h = allMaps[index].height;
		switch (layout) {
			case 'layout2':
				if (index === 1) {
					x = allMaps[0].width;
				}
				break;
			case 'layout3':
				if (index === 1) {
					y = allMaps[0].height;
				}
				break;
			case 'layout4':
				if (index === 1) {
					x = allMaps[0].width;
				} else if (index === 2) {
					x = allMaps[0].width;
					y = allMaps[1].height;
				}
				break;
			case 'layout5':
				if (index === 1) {
					y = allMaps[0].height;
				} else if (index === 2) {
					x = allMaps[1].width;
					y = allMaps[0].height;
				}
				break;
			case 'layout6':
				if (index === 1) {
					x = allMaps[0].width;
				} else if (index === 2) {
					y = allMaps[0].height;
				} else if (index === 3) {
					x = allMaps[2].width;
					y = allMaps[1].height;
				}
				break;
		}

		if (img.src) {
			ctx.drawImage(img, x, y, w, h);
		} else {

			ctx.fillText('Unable to get map image', x + (img.width / 2), y + (img.height / 2));
		}
	}
}
