import RasterSource from 'ol/source/Raster';

// skipOnValue is the value which the image do not require any processing (e.i. the natural/default value)
export const IMG_PROCESS_ORDER = [
	{ ArgumentName: 'Histogram', skipOnValue: 0 },
	{ ArgumentName: 'Gamma', skipOnValue: 100 },
	{ ArgumentName: 'Contrast', skipOnValue: 0 },
	{ ArgumentName: 'Saturation', skipOnValue: 100 },
	{ ArgumentName: 'Brightness', skipOnValue: 0 },
	{ ArgumentName: 'Sharpness', skipOnValue: 0, perImage: true }
];

interface IProcessOperation {
	type: string,
	args: any
}

// design based on : https://openlayers.org/en/latest/examples/raster.html
export class OpenLayersImageProcessing {
	private _libs: Object;
	private _raster: RasterSource | any;

	constructor(layerSource?: RasterSource) {
		this.initializeOperations();
		if (layerSource) {
			this.initializeRaster(layerSource);
		}
	}

	initializeRaster(layerRaster: RasterSource): void {
		this._raster = layerRaster;
		// register pixelOperations to raster event
		this._raster.on('beforeoperations', (event) => {
			event.data.pixelOperations = this._raster.get('pixelOperations');
			event.data.imageOperations = this._raster.get('imageOperations');
		});

		// set a raster operation
		this._raster.setOperation(this.cascadeOperations, this._libs);
	}

	initializeOperations(): void {
		// Getting the functions generically
		this._libs = Object.getPrototypeOf(this);
	}

	processImage(operationsArguments: Object): void {
		if (!this._raster) {
			return;
		}

		// collection operation by processingParams
		const pixelOperations: IProcessOperation[] = [];
		const imageOperations: IProcessOperation[] = [];

		// collect parameters in processing order
		IMG_PROCESS_ORDER.forEach(operation => {
			// operationsArguments has provided (for example: {Brightness: 34} )
			if (operationsArguments && operationsArguments.hasOwnProperty(operation.ArgumentName)) {
				// add operation to pixelOperations in order
				const operationArgs = operationsArguments[operation.ArgumentName];

				// if provided argument equal to skip (default) value - skip processing for this parameter
				if (operationArgs !== operation.skipOnValue) {
					const currentOperation = {
						type: operation.ArgumentName,
						args: operationArgs
					};
					(operation.perImage ? imageOperations : pixelOperations).push(currentOperation);
				}
			}
		});

		// set operations parameters
		this._raster.set('pixelOperations', pixelOperations);
		this._raster.set('imageOperations', imageOperations);
		this._raster.changed();
	}

	// ------ General Operation Start ------ //
	cascadeOperations(pixels, data): any {
		const pixelOperations = data.pixelOperations;
		const imageOperations = data.imageOperations;
		const imageData = pixels[0];
		const conversionFn: { fn, args }[] = [];
		let outputImageData = imageData;

		if (pixelOperations) {
			// collect per-pixel operations (function + arguments)
			Object.keys(pixelOperations).forEach(key => {
				const operation = pixelOperations[key];
				const operationFn = this.getFunctionByArgument(operation.type);
				let operationArgs = operation.args;
				if (operationFn) {
					if (operation.type === 'Histogram') {
						operationArgs = this.buildHistogramLut(imageData);
					}
					conversionFn.push({
						fn: operationFn.bind(this),
						args: operationArgs
					});
				}
			});
			// run per-pixel operations
			outputImageData = this.forEachRGBPixel(imageData, conversionFn);
		}
		if (imageOperations) {
			// run image operations (process all pixel at once)
			Object.keys(imageOperations).forEach(key => {
				const operation = imageOperations[key];
				const operationFn = this.getFunctionByArgument(operation.type);
				outputImageData = operationFn(outputImageData, operation.args);
			});
		}

		return outputImageData;
	}

	getFunctionByArgument(arg): Function {
		return arg ? this[`perform${ arg }`] : null;
	}

	fillArray(size, item): any[] {
		return new Array(size).fill(item);
	}

	// ------ General Operation End ------ //

	// ------ Histogram Start ------ //

	rgb2YCbCr(rgb): { y: number, cb, cr } {
		const y = 16 + 0.257 * rgb.r + 0.504 * rgb.g + 0.098 * rgb.b;
		const cb = 128 - 0.148 * rgb.r - 0.291 * rgb.g + 0.439 * rgb.b;
		const cr = 128 + 0.439 * rgb.r - 0.368 * rgb.g - 0.071 * rgb.b;

		return { y, cb, cr };
	}

	yCbCr2RGB(yCbCr): any {
		const yNorm = yCbCr.y - 16;
		const cbNorm = yCbCr.cb - 128;
		const crNorm = yCbCr.cr - 128;

		const r = 1.164 * yNorm + 1.596 * crNorm;
		const g = 1.164 * yNorm - 0.392 * cbNorm - 0.813 * crNorm;
		const b = 1.164 * yNorm + 2.017 * cbNorm;

		return { r, g, b };
	}


	buildHistogramLut(imageData): any[] {
		const BANDS = 4, CUTEDGE = 85, MAXBIT = 256;

		const colorChannels = 3;
		const histogram = this.fillArray(MAXBIT, 0);
		const { width, height, data } = imageData;
		for (let i = 0; i < data.length; i += BANDS) {
			const pixel = data.subarray(i, i + BANDS);

			// increasing the histogram for the 3 color channels: red, green and blue.
			for (let i = 0; i < colorChannels; i++) {
				histogram[pixel[i]]++;
			}
		}
		const totalPixels = width * height;
		const pixelToCut = totalPixels / CUTEDGE;
		let minPixel = 0, maxPixel = 0, pixelsSoFar = 0;
		for (let i = 0; i < MAXBIT; i++) {
			minPixel = i;
			pixelsSoFar += histogram[i];
			if (pixelsSoFar > pixelToCut) {
				break;
			}
		}
		pixelsSoFar = 0;
		for (let i = 0; i < MAXBIT; i++) {
			maxPixel = 255 - i;
			pixelsSoFar += histogram[255 - i];
			if (pixelsSoFar > pixelToCut) {
				break;
			}
		}

		return this.fillArray(MAXBIT, 0).map((val, index) => this.normalizeColor(255 * (index - minPixel) / (maxPixel - minPixel)));
	}

	performHistogram(pixel, histogramLut): any {
		return {
			r: histogramLut[pixel.r],
			g: histogramLut[pixel.g],
			b: histogramLut[pixel.b],
			a: pixel.a
		};
	}


	getWeights(sharpness: number): number[] {
		// matrix sum should be equal to 1 to maintain the brightness
		const s = sharpness / 10;
		const t = -((s - 1) / 4);
		return [0, t, 0,
			t, s, t,
			0, t, 0];
	}

	// ------ Histogram Equalization End ------ //

	// ------ Sharpness Start ------ //
	// based on: Convolving images
	// https://www.html5rocks.com/en/tutorials/canvas/imagefilters/
	performSharpness(imageData, args): any {
		const AUTO_SHARPNESS = 30;
		const weights = this.getWeights(args.auto ? AUTO_SHARPNESS : args);

		const side = Math.round(Math.sqrt(weights.length));
		const halfSide = Math.floor(side / 2);
		const pixels = imageData.data;
		const imageWidth = imageData.width;
		const imageHeight = imageData.height;

		const destPixels = [];

		for (let y = 0; y < imageHeight; y++) {
			for (let x = 0; x < imageWidth; x++) {
				const dstOff = (y * imageWidth + x) * 4;

				let r = 0, g = 0, b = 0;
				for (let cy = 0; cy < side; cy++) {
					for (let cx = 0; cx < side; cx++) {
						const scy = y + cy - halfSide;
						const scx = x + cx - halfSide;
						if (scy >= 0 && scy < imageHeight && scx >= 0 && scx < imageWidth) {
							const srcOff = (scy * imageWidth + scx) * 4;
							const wt = weights[cy * side + cx];
							r += pixels[srcOff] * wt;
							g += pixels[srcOff + 1] * wt;
							b += pixels[srcOff + 2] * wt;
						}
					}
				}

				destPixels[dstOff] = this.normalizeColor(r);
				destPixels[dstOff + 1] = this.normalizeColor(g);
				destPixels[dstOff + 2] = this.normalizeColor(b);
				destPixels[dstOff + 3] = pixels[dstOff + 3];
			}
		}

		for (let index = 0; index < imageData.data.length; index++) {
			imageData.data[index] = destPixels[index];
		}

		return imageData;
	}

	normalizeColor(color: number): number {
		if (color < 0) {
			return 0;
		} else if (color > 255) {
			return 255;
		} else {
			return color;
		}
	}

	// ------ Sharpness End ------ //

	// ------ Contrast start ------ //
	performContrast(pixel, contrast): any {
		const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
		return {
			r: factor * (pixel.r - 128) + 128,
			g: factor * (pixel.g - 128) + 128,
			b: factor * (pixel.b - 128) + 128,
			a: pixel.a
		};
	}

	// ------ Contrast End ------ //

	// ------ Brightness start ------ //
	performBrightness(pixel, brightness): any {
		return {
			r: pixel.r + brightness,
			g: pixel.g + brightness,
			b: pixel.b + brightness,
			a: pixel.a
		};
	}

	// ------ Brightness End ------ //

	// ------ Gamma start ------ //
	// based on:
	// http://www.dfstudios.co.uk/articles/programming/image-programming-algorithms/image-processing-algorithms-part-6-gamma-correction/
	performGamma(pixel, gamma): any {
		// const DEFAULT_VALUE = 1;
		// gamma sent range [1-200], should be converted to [0.01-2.00], hence gamma / 100
		const gammaCorrection = 1 / (gamma / 100);
		return {
			r: 255 * Math.pow((pixel.r / 255), gammaCorrection),
			g: 255 * Math.pow((pixel.g / 255), gammaCorrection),
			b: 255 * Math.pow((pixel.b / 255), gammaCorrection),
			a: pixel.a
		};
	}

	// ------ Gamma  End ------ //

	// ------ Saturation start ------ //
	// based on:
	// https://stackoverflow.com/questions/13348129/using-native-javascript-to-desaturate-a-colour
	performSaturation(pixel, saturation: number): any {
		// saturation sent range [1-100], should be converted to [0.01-1.00], hence saturation / 100
		saturation /= 100;
		const gray = pixel.r * 0.3086 + pixel.g * 0.6094 + pixel.b * 0.0820; // gray range [1-255]
		return {
			r: Math.round(pixel.r * saturation + gray * (1 - saturation)),
			g: Math.round(pixel.g * saturation + gray * (1 - saturation)),
			b: Math.round(pixel.b * saturation + gray * (1 - saturation)),
			a: pixel.a
		};
	}

	// ------ Saturation  End ------ //
	// process a list of operation on each pixel
	forEachRGBPixel(imageData, conversionFn: Array<any>): any {
		const pixel = { r: 0, g: 0, b: 0, a: 0 };
		let convertedPixel;

		for (let index = 0; index < imageData.data.length; index += 4) {
			pixel.r = imageData.data[index];
			pixel.g = imageData.data[index + 1];
			pixel.b = imageData.data[index + 2];
			pixel.a = imageData.data[index + 3];
			// do conversion
			convertedPixel = pixel;
			conversionFn.forEach(fnData => convertedPixel = fnData.fn(convertedPixel, fnData.args));

			imageData.data[index] = convertedPixel.r;
			imageData.data[index + 1] = convertedPixel.g;
			imageData.data[index + 2] = convertedPixel.b;
			imageData.data[index + 3] = convertedPixel.a;
		}

		return imageData;
	}
}
