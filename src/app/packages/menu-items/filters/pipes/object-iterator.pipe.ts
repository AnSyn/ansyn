import { Component, Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'objectIterator' })
export class ObjectIteratorPipe implements PipeTransform {
    transform(value: any, args?: any[]): Object[] {
        let keys = [];
        for (let key in value) {
            keys.push({ key: key, value: value[key] });
        }
        return keys;
    }
}
