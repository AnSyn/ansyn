import * as ol from 'openlayers';

export type pixelOperation = (pixels: ImageData[], data: Object) => (ImageData);
export type rasterOperation = { name: string, operation: pixelOperation, lib: {} };

export type supportedOperations = 'Histogram' | 'Sharpness';

export const operations = [];

export class OpenLayersImageProcessing {

    _rasterToOperations: Map<ol.source.Raster, rasterOperation[]>;
    _operations: Map<string, rasterOperation>;

    constructor() {
        this._rasterToOperations = new Map<ol.source.Raster, rasterOperation[]>();
        this._operations = new Map<string, rasterOperation>();

        this.initializeOperations();
    }

    initializeOperations() {
        this.initializeHistogramEqualization();
    }

    initializeHistogramEqualization() {
        const lib = {
            buildHistogramLut: buildHistogramLut,
            performHistogram: performHistogram,
            rgb2YCbCr: rgb2YCbCr,
            yCbCr2RGB: yCbCr2RGB
        };

        this._operations.set('Histogram', { name: 'Histogram', operation: histogramEqualization, lib: lib });
    }

    addOperation(raster: ol.source.Raster, name: supportedOperations) {
        const currentOperations = this._rasterToOperations.get(raster);
        const requestedOperation = this._operations.get(name);

        if (!requestedOperation) {
            throw new Error(`No operation defined under the name ${name}`);
        }

        if (!currentOperations) {
            this._rasterToOperations.set(raster, [requestedOperation]);
        } else {
            currentOperations.push({ name: requestedOperation.name, operation: requestedOperation.operation, lib: requestedOperation.lib });
        }

        this.syncOperations(raster);
    }

    removeOperation(raster: ol.source.Raster, name: supportedOperations) {
        const currentOperations = this._rasterToOperations.get(raster);
        if (currentOperations) {
            const operationToRemove = currentOperations.find((operation) => operation.name === name);
            const index = currentOperations.indexOf(operationToRemove);

            if (index > -1) {
                currentOperations.splice(index, 1);

                if (currentOperations.length === 0) {
                    this._rasterToOperations.delete(raster);
                }
            }
        }

        this.syncOperations(raster);
    }

    removeAllRasterOperations(raster: ol.source.Raster) {
        this._rasterToOperations.delete(raster);

        this.syncOperations(raster);
    }

    syncOperations(raster: ol.source.Raster) {
        const currentOperations = this._rasterToOperations.get(raster);
        if (currentOperations) {
            let globalLib = {};
            const operationsArray = [];

            currentOperations.forEach((operation: rasterOperation) => {
                operationsArray.push(operation.operation);
                for (let property in operation.lib) {
                    if (operation.lib.hasOwnProperty(property)) {
                        globalLib[property] = operation.lib[property];
                    }
                }
            });

            let operationsFunctionsString = '[';
            operationsArray.forEach((func) => {
                operationsFunctionsString += func.toString() + ',';
            });

            operationsFunctionsString = operationsFunctionsString.replace(/,\s*$/, "");

            operationsFunctionsString += ']';

            globalLib['operations'] = operationsFunctionsString;

            raster.setOperation(cascadeOperations, globalLib);
        } else {
            raster.setOperation(basicOperation);
        }
    }
}

// ------ General Operation Start ------ //

function basicOperation(pixels, data) {
    return pixels[0];
}

function cascadeOperations(pixels, data) {
    let imageData = pixels[0];
    this['operations'].forEach((operation) => {
		imageData = operation(imageData);
	});
	return imageData;
}

// ------ General Operation End ------ //

// ------ Histogram Equalization Start ------ //

function histogramEqualization(imageData, data) {
    let histLut = this['buildHistogramLut'](imageData);
    return this['performHistogram'](imageData, histLut);
}

function rgb2YCbCr(rgb) {
    const y = 16 + 0.257 * rgb.r + 0.504 * rgb.g + 0.098 * rgb.b;
    const cb = 128 - 0.148 * rgb.r - 0.291 * rgb.g + 0.439 * rgb.b;
    const cr = 128 + 0.439 * rgb.r - 0.368 * rgb.g - 0.071 * rgb.b;

    return { y, cb, cr };
}

function yCbCr2RGB(yCbCr) {
    const yNorm = yCbCr.y - 16;
    const cbNorm = yCbCr.cb - 128;
    const crNorm = yCbCr.cr - 128;

    const r = 1.164 * yNorm + 0 * cbNorm + 1.596 * crNorm;
    const g = 1.164 * yNorm - 0.392 * cbNorm - 0.813 * crNorm;
    const b = 1.164 * yNorm + 2.017 * cbNorm + 0 * crNorm;

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
