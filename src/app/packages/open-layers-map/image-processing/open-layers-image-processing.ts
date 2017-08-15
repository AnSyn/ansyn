import Raster from 'ol/source/raster';

export type pixelOperation = (pixels: ImageData[], data: Object) => (ImageData);
export type rasterOperation = { name: string, operation: pixelOperation, lib: {} };

export type supportedOperations = 'Histogram' | 'Sharpness';

export const operations = [];

export class OpenLayersImageProcessing {

    _rasterToOperations: Map<Raster, rasterOperation[]>;
    _operations: Map<string, rasterOperation>;

    constructor() {
        this._rasterToOperations = new Map<Raster, rasterOperation[]>();
        this._operations = new Map<string, rasterOperation>();

        this.initializeOperations();
    }

    initializeOperations() {
        this.initializeHistogramEqualization();
        this.initializeSharpness();
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

    initializeSharpness() {
        const lib = {
            weights: `[0, -1, 0,
                -1, 5, -1,
                0, -1, 0]`,
            normalizeColor: normalizeColor
        };

        this._operations.set('Sharpness', { name: 'Sharpness', operation: performSharpness, lib: lib });

    }

    addOperation(raster: Raster, name: supportedOperations) {
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

    removeOperation(raster: Raster, name: supportedOperations) {
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

    removeAllRasterOperations(raster: Raster) {
        this._rasterToOperations.delete(raster);

        this.syncOperations(raster);
    }

    syncOperations(raster: Raster) {
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
