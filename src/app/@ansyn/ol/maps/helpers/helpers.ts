import { Observable } from 'rxjs';

export function exportMapHelper(mapObject, size, resolution, classToInclude): Observable<HTMLCanvasElement> {
	const width = Math.round((size[0] * resolution) / 25.4);
	const height = Math.round((size[1] * resolution) / 25.4);
	const mapSize = mapObject.getSize();
	const viewResolution = mapObject.getView().getResolution();
	return new Observable<HTMLCanvasElement>((observer) => {
		mapObject.once('rendercomplete', () => {
			const mapCanvas = document.createElement('canvas');
			mapCanvas.width = width;
			mapCanvas.height = height;
			const mapContext = mapCanvas.getContext('2d');
			mapObject.getViewport().querySelectorAll(classToInclude).forEach(
				function (canvas: HTMLCanvasElement) {
					if (canvas.width > 0) {
						const opacity = (canvas.parentNode as any).style.opacity;
						mapContext.globalAlpha = opacity === '' ? 1 : Number(opacity);
						const transform = canvas.style.transform;
						// Get the transform parameters from the style's transform matrix
						const matrix = transform
							.match(/^matrix\(([^\(]*)\)$/)[1]
							.split(',')
							.map(Number);
						// Apply the transform to the export map context
						CanvasRenderingContext2D.prototype.setTransform.apply(
							mapContext,
							matrix
						);
						mapContext.drawImage(canvas, 0, 0);
					}
				});
			observer.next(mapCanvas);
			mapObject.setSize(mapSize);
			mapObject.getView().setResolution(viewResolution);
			observer.complete();
		});
		const printSize = [width, height];
		mapObject.setSize(printSize);
		const scaling = Math.min(width / mapSize[0], height / size[1]);
		mapObject.getView().setResolution(viewResolution / scaling);
	});
}
