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
var common_1 = require('@angular/common');
var core_2 = require('@ansyn/core');
var imagery_component_1 = require('./imageryProvider/imagery.component');
var ImageryModule = (function () {
    function ImageryModule() {
    }
    ImageryModule = __decorate([
        core_1.NgModule({
            imports: [common_1.CommonModule, core_2.CoreModule],
            declarations: [imagery_component_1.ImageryComponent],
            exports: [imagery_component_1.ImageryComponent]
        })
    ], ImageryModule);
    return ImageryModule;
}());
exports.ImageryModule = ImageryModule;
