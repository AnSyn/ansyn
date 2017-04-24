"use strict";
var OpenLayerMap = (function () {
    function OpenLayerMap(elementid) {
        this.initMap(elementid);
    }
    OpenLayerMap.prototype.initMap = function (elementId) {
        var osm_default = new ol.layer.Tile({
            source: new ol.source.OSM()
        });
        var map = new ol.Map({
            target: elementId,
            layers: [osm_default],
            renderer: 'canvas',
            controls: [],
            view: new ol.View({
                center: ol.proj.fromLonLat([16, 38]),
                zoom: 12
            })
        });
    };
    Object.defineProperty(OpenLayerMap.prototype, "type", {
        get: function () {
            return 'openLayers';
        },
        // IProvidedMap Start
        set: function (value) { },
        enumerable: true,
        configurable: true
    });
    OpenLayerMap.prototype.setCenter = function (center) {
    };
    OpenLayerMap.prototype.setBoundingRectangle = function (rect) {
    };
    return OpenLayerMap;
}());
exports.OpenLayerMap = OpenLayerMap;
