"use strict";
var openLayerMap_1 = require('../maps/openLayerMap');
var ImageryProvider = (function () {
    function ImageryProvider() {
    }
    ImageryProvider.prototype.init = function (elementId, type) {
        var mapProvided;
        switch (type) {
            case 'openLayers':
                mapProvided = new openLayerMap_1.OpenLayerMap(elementId);
                break;
            default:
                mapProvided = new openLayerMap_1.OpenLayerMap(elementId);
        }
        return mapProvided;
    };
    return ImageryProvider;
}());
exports.ImageryProvider = ImageryProvider;
