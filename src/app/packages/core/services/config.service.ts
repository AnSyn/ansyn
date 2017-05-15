import { Injectable, Optional } from '@angular/core';

export class ConfigSource { };

@Injectable()
export class Config {

    constructor( @Optional() private config: ConfigSource) { }

    public get(key: any) {
        return this.getNestedProperty(this.config, key);
    }

    private getNestedProperty(object, property) {
        if (object && typeof object === "object") {
            if (typeof property === "string" && property !== "") {
                var split = property.split(".");
                return split.reduce(function (obj, prop) {
                    return obj && obj[prop];
                }, object);
            } else if (typeof property === "number") {
                return object[property];
            } else {
                return object;
            }
        } else {
            return object;
        }
    }
};
