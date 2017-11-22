import Raster from 'ol/source/raster';

export const IMG_PROCESS_ORDER = ['Histogram_Auto', 'Histogram_manual', 'Gamma', 'Contrast', 'Saturation', 'Brightness', 'Sharpness'];

export type pixelOperation = (pixels: ImageData[], data: Object) => (ImageData);

export interface IRasterOperation {
	name: string,
	operation: pixelOperation,
	lib: {}
}


export const operations = [];

export class OpenLayersImageProcessing {

	_rasterToOperations = new Map<Raster, IRasterOperation[]>();
	_operations = new Map<string, IRasterOperation>();
	_operationsAsStrings = new Map<string, string>();
	_libsAsStrings = new Map<string, string>();

	constructor() {
		this.initializeOperations();
	}

	initializeOperations() {
		this.initializeAutoHistogramEqualization();
		this.initializeSharpness();
		this.initializeBasicOperations([
			{ name: 'Contrast', perform: performContrast },
			{ name: 'Brightness', perform: performBrightness },
			{ name: 'Gamma', perform: performGamma },
			{ name: 'Saturation', perform: performSaturation},
		])
	}

	// initialize all Basic Operations
	initializeBasicOperations(basicOperations) {
		const standardOperationLib = {
			forEachRGBPixel: forEachRGBPixel
		};
		basicOperations.forEach(oper => {
			this.addOperation({
				name: oper.name,
				operation: oper.perform,
				lib: standardOperationLib
			});
		});
	}

	addOperation(operation) {
		this._operations.set(operation.name, operation);
		this._operationsAsStrings.set(operation.name, operation.operation.toString());
		Object.keys(operation.lib).forEach((property) => {
			this._libsAsStrings.set(property, operation.lib[property]);
		});
	}

	initializeAutoHistogramEqualization() {
		const lib = {
			buildHistogramLut: buildHistogramLut,
			performHistogram: performHistogram,
			rgb2YCbCr: rgb2YCbCr,
			yCbCr2RGB: yCbCr2RGB
		};
		const operation = {
			name: 'Histogram_Auto',
			operation: histogramEqualization,
			lib: lib
		};
		this.addOperation(operation);
	}

	initializeSharpness() {
		const lib = {
			weights: `[0, -1, 0,
                -1, 5, -1,
                0, -1, 0]`,
			normalizeColor: normalizeColor
		};
		const operation = {
			name: 'Sharpness',
			operation: performSharpness,
			lib: lib
		};
		this.addOperation(operation);
	}

	processUsingRaster(raster: Raster, processingParams: Object) {
		const operationsArguments = processingParams;
		this._rasterToOperations.delete(raster);
		// collection operation by processingParams
		const operations = new Array<IRasterOperation>();
		// todo: by order
		IMG_PROCESS_ORDER.forEach(processKey => {
			if (operationsArguments.hasOwnProperty(processKey)) {
				const operation = this._operations.get(processKey);
				if (operation) {
					operations.push(operation);
				}
			}
		});

		// set operations and process
		if (operations.length > 0) {
			this.syncOperations(raster, operations, processingParams);
		} else {
			raster.setOperation(resetOperation);
		}
	}

	removeAllRasterOperations(raster: Raster) {
		this._rasterToOperations.delete(raster);
		raster.setOperation(resetOperation);
	}

	// convert object to string and make functions into arrays (so OL can process it)
	syncOperations(raster: Raster, operations: IRasterOperation[], operationsArguments: Object) {
		let globalLib = {};

		let operationsFunctionsString = '[';
		let operationsArgumentsString = '[';
		for (let i = 0; i < operations.length; i++) {
			operationsFunctionsString += this._operationsAsStrings.get(operations[i].name);
			operationsArgumentsString += JSON.stringify(operationsArguments[operations[i].name]);

			if (i < operations.length - 1) {
				operationsFunctionsString += ',';
				operationsArgumentsString += ',';
			}
		}
		operationsFunctionsString += ']';
		operationsArgumentsString += ']';

		globalLib['operations'] = operationsFunctionsString;
		globalLib['operationsArgs'] = operationsArgumentsString;

		this._libsAsStrings.forEach((lib, libName) => globalLib[libName] = lib);

		raster.setOperation(cascadeOperations, globalLib);
	}
}

// ------ General Operation Start ------ //

function resetOperation(pixels) {
	// return the original pixels collection
	return pixels[0];
}

function cascadeOperations(pixels) {
	let imageData = pixels[0];
	const operations = this['operations'];
	const operationsArgs = this['operationsArgs'];

	operations.forEach((operation, index) => {
		console.log('do ' + operation.name + ' with: ', operationsArgs[index]);
		imageData = operation(imageData, operationsArgs[index]);
	});
	return imageData;
}

// ------ General Operation End ------ //

// ------ Histogram Equalization Start ------ //

function histogramEqualization(imageData, data) {
	let histLut = this['buildHistogramLut'](imageData);
	return this['performHistogram'](imageData, histLut);
}

function rgb2YCbCr(rgb): { y: number, cb, cr } {
	const y = 16 + 0.257 * rgb.r + 0.504 * rgb.g + 0.098 * rgb.b;
	const cb = 128 - 0.148 * rgb.r - 0.291 * rgb.g + 0.439 * rgb.b;
	const cr = 128 + 0.439 * rgb.r - 0.368 * rgb.g - 0.071 * rgb.b;

	return { y, cb, cr };
}

function yCbCr2RGB(yCbCr) {
	const yNorm = yCbCr.y - 16;
	const cbNorm = yCbCr.cb - 128;
	const crNorm = yCbCr.cr - 128;

	const r = 1.164 * yNorm + 1.596 * crNorm;
	const g = 1.164 * yNorm - 0.392 * cbNorm - 0.813 * crNorm;
	const b = 1.164 * yNorm + 2.017 * cbNorm;

	return { r, g, b };
}

function buildHistogramLut(imageData) {
	const totalHistLut = [];

	for (let index = 16; index < 236; index++) {
		totalHistLut[index] = 0;
	}

	for (let index = 0; index < imageData.data.length; index += 4) {
		const r = imageData.data[index];
		const g = imageData.data[index + 1];
		const b = imageData.data[index + 2];

		const yCbCr = this['rgb2YCbCr']({ r, g, b });

		const val = Math.floor(yCbCr.y);
		if (totalHistLut[val] === undefined) {
			totalHistLut[val] = 1;
		} else {
			totalHistLut[val] = totalHistLut[val] + 1;
		}
	}

	const cumulativeHist = [];

	cumulativeHist[16] = totalHistLut[16];

	for (let index = 17; index < totalHistLut.length; index++) {
		let tempTotalHist = totalHistLut[index] === undefined ? 0 : totalHistLut[index];
		cumulativeHist[index] = cumulativeHist[index - 1] + tempTotalHist;
	}

	let pixelsNum = 0;
	totalHistLut.forEach((hist) => pixelsNum += hist);

	const minCumProbability = cumulativeHist[16];
	const finalHist = [];

	for (let index = 16; index < cumulativeHist.length; index++) {
		const diff = cumulativeHist[index] - minCumProbability;

		finalHist[index] = Math.floor((diff / (pixelsNum - 1)) * (235 - 16 - 1) + 16);
	}

	return finalHist;
}

function performHistogram(imageData, histogramLut) {
	for (let index = 0; index < imageData.data.length; index += 4) {
		const r = imageData.data[index];
		const g = imageData.data[index + 1];
		const b = imageData.data[index + 2];
		const a = imageData.data[index + 3];

		const yCbCr = this['rgb2YCbCr']({ r, g, b });

		yCbCr.y = histogramLut[Math.floor(yCbCr.y)];

		const rgb = this['yCbCr2RGB'](yCbCr);

		imageData.data[index + 0] = rgb.r;	// Red
		imageData.data[index + 1] = rgb.g;	// Green
		imageData.data[index + 2] = rgb.b;	// Blue
		imageData.data[index + 3] = a;	// Alpha
	}

	return imageData;
}

// ------ Histogram Equalization End ------ //

// ------ Sharpness Start ------ //

function performSharpness(imageData, data) {
	const side = Math.round(Math.sqrt(this['weights'].length));
	const halfSide = Math.floor(side / 2);
	const pixels = imageData.data;
	const imageWidth = imageData.width;
	const imageHeight = imageData.height;

	const destPixels = [];

	for (let y = 0; y < imageHeight; y++) {
		for (let x = 0; x < imageWidth; x++) {
			const dstOff = (y * imageWidth + x) * 4;

			let r = 0, g = 0, b = 0, a = 0;
			for (let cy = 0; cy < side; cy++) {
				for (let cx = 0; cx < side; cx++) {
					const scy = y + cy - halfSide;
					const scx = x + cx - halfSide;
					if (scy >= 0 && scy < imageHeight && scx >= 0 && scx < imageWidth) {
						const srcOff = (scy * imageWidth + scx) * 4;
						const wt = this['weights'][cy * side + cx];
						r += pixels[srcOff] * wt;
						g += pixels[srcOff + 1] * wt;
						b += pixels[srcOff + 2] * wt;
					}
				}
			}

			destPixels[dstOff] = this['normalizeColor'](r);
			destPixels[dstOff + 1] = this['normalizeColor'](g);
			destPixels[dstOff + 2] = this['normalizeColor'](b);
			destPixels[dstOff + 3] = pixels[dstOff + 3];
		}
	}

	for (let index = 0; index < imageData.data.length; index++) {
		imageData.data[index] = destPixels[index];
	}
	return imageData;
}

function normalizeColor(color) {
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
function performContrast(imageData, contrast) {
	const DEFAULT_VALUE = 0;
	const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
	const performOnSegment = (segment: number) => {
		return factor * (segment - 128) + 128;
	};
	const performOnPixel = (pixel) => {
		return {
			r: performOnSegment(pixel.r),
			g: performOnSegment(pixel.g),
			b: performOnSegment(pixel.b),
			a: pixel.a
		};
	};
	if (contrast !== DEFAULT_VALUE) {
		imageData = this['forEachRGBPixel'](imageData, performOnPixel);
	}

	return imageData;
}

// ------ Contrast End ------ //

// ------ Brightness start ------ //
function performBrightness(imageData, brightness) {
	const DEFAULT_VALUE = 0;
	const performOnSegment = (segment: number) => segment + brightness;
	const performOnPixel = (pixel) => {
		return {
			r: performOnSegment(pixel.r),
			g: performOnSegment(pixel.g),
			b: performOnSegment(pixel.b),
			a: pixel.a
		};
	};

	if (brightness !== DEFAULT_VALUE) {
		imageData = this['forEachRGBPixel'](imageData, performOnPixel);
	}
	return imageData;
}

// ------ Brightness End ------ //

// ------ Gamma start ------ //
// based on:
// http://www.dfstudios.co.uk/articles/programming/image-programming-algorithms/image-processing-algorithms-part-6-gamma-correction/
function performGamma(imageData, gamma) {
	// gamma sent range [1-200], should be converted to [0.01-2.00], hence gamma / 100
	const DEFAULT_VALUE = 1;
	const gammaCorrection = 1 / (gamma / 100);

	const performOnSegment = (segment: number) => 255 * Math.pow((segment / 255), gammaCorrection);
	const performOnPixel = (pixel) => {
		return {
			r: performOnSegment(pixel.r),
			g: performOnSegment(pixel.g),
			b: performOnSegment(pixel.b),
			a: pixel.a
		}
	};

	if (gammaCorrection !== DEFAULT_VALUE) {
		imageData = this['forEachRGBPixel'](imageData, performOnPixel);
	}
	return imageData;
}
// ------ Gamma  End ------ //

// ------ Saturation start ------ //
// based on:
// https://stackoverflow.com/questions/13348129/using-native-javascript-to-desaturate-a-colour
function performSaturation(imageData, saturation) {
	// saturation sent range [1-100], should be converted to [0.01-1.00], hence saturation / 100
	const DEFAULT_VALUE = 1;
	saturation = saturation / 100;

	const performOnSegment = (segment: number, gray: number) => {
		return Math.round(segment * saturation + gray * (1 - saturation));
	};
	const performOnPixel = (pixel) => {
		const gray = pixel.r * 0.3086 + pixel.g * 0.6094 + pixel.b * 0.0820; // gray range [1-255]
		return {
			r: performOnSegment(pixel.r, gray),
			g: performOnSegment(pixel.g, gray),
			b: performOnSegment(pixel.b, gray),
			a: pixel.a
		}
	};
	if (saturation !== DEFAULT_VALUE) {
		imageData = this['forEachRGBPixel'](imageData, performOnPixel);
	}
	return imageData;
}
// ------ Saturation  End ------ //

function forEachRGBPixel(imageData, conversionFn) {
	const pixel = { r: 0, g: 0, b: 0, a: 0 };
	let convertedPixel;

	for (let index = 0; index < imageData.data.length; index += 4) {
		pixel.r = imageData.data[index];
		pixel.g = imageData.data[index + 1];
		pixel.b = imageData.data[index + 2];
		pixel.a = imageData.data[index + 3];
		// do conversion
		convertedPixel = conversionFn(pixel);

		imageData.data[index + 0] = convertedPixel.r;	// Red
		imageData.data[index + 1] = convertedPixel.g;	// Green
		imageData.data[index + 2] = convertedPixel.b;	// Blue
		imageData.data[index + 3] = convertedPixel.a;	// Alpha
	}

	return imageData;
}
