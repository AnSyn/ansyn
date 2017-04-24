"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
/**
 * Created by AsafMasa on 25/04/2017.
 */
var core_1 = require('@angular/core');
var imageryProvider_1 = require('./imageryProvider');
var ImageryComponent = (function () {
    function ImageryComponent() {
    }
    ImageryComponent.prototype.ngOnInit = function () {
        var imageryProvider = new imageryProvider_1.ImageryProvider();
        if (!this.mapComponentSettings) {
            console.error('mapComponentSettings is Needed!');
            return;
        }
        var element = document.createElement('div');
        element.id = 'openLayersMap';
        this.imageryElement.nativeElement.appendChild(element);
        imageryProvider.init(element.id, 'openLayers');
    };
    __decorate([
        core_1.ViewChild('imagery')
    ], ImageryComponent.prototype, "imageryElement", void 0);
    __decorate([
        core_1.Input()
    ], ImageryComponent.prototype, "mapComponentSettings", void 0);
    ImageryComponent = __decorate([
        core_1.Component({
            moduleId: module.id,
            selector: 'imagery-view',
            template: "\n    <div #imagery></div>\n  "
        })
    ], ImageryComponent);
    return ImageryComponent;
}());
exports.ImageryComponent = ImageryComponent;
