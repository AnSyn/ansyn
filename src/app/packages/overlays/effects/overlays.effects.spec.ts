//import 'rxjs/add/operator/map';
//import 'rxjs/add/operator/catch';
//import 'rxjs/add/operator/startWith';
//import 'rxjs/add/operator/switchMap';
//import 'rxjs/add/operator/mergeMap';
//import 'rxjs/add/operator/toArray';
import { of } from 'rxjs/observable/of';
import { empty } from 'rxjs/observable/empty';


import { EffectsTestingModule, EffectsRunner } from '@ngrx/effects/testing';
import { TestBed, fakeAsync, tick } from '@angular/core/testing';

import { Injectable } from '@angular/core';
import { Action } from '@ngrx/store';
import { Effect, Actions, toPayload } from '@ngrx/effects';

import { Observable, ObservableInput } from 'rxjs/Observable';
import { SelectOverlayAction, LoadOverlaysAction, LoadOverlaysSuccessAction, LoadOverlaysFailAction, ClearFilter, SetFilter } from '../actions/overlays.actions';
//import * as collection from '../actions/collection';

import { Overlay } from '../models/overlay.model';
import * as overlay from '../actions/overlays.actions';
import { OverlaysEffects } from './overlays.effects';
import { OverlaysService } from '../services/overlays.service';

describe("Overlays Effects ", () => {
    const overlays = <Overlay[]>[
        {
            id: '12',
            name: 'tmp12',
            photoTime: new Date(Date.now()),
            azimuth: 10
        },
        {
            id: '13',
            name: 'tmp13',
            photoTime: new Date(Date.now()),
            azimuth: 10
        }
    ]

    beforeEach(() => TestBed.configureTestingModule({
        imports: [
            EffectsTestingModule
        ],
        providers: [
            OverlaysEffects, {
                provide: OverlaysService,
                useValue: jasmine.createSpyObj('overlaysService', ['fetchData'])
            }
        ]
    }));

    function setup() {
        return {
            runner: TestBed.get(EffectsRunner),
            overlaysEffects: TestBed.get(OverlaysEffects),
            overlaysService: TestBed.get(OverlaysService)
        }
    };

    it('it should load all the overlays', () => {
        const { runner, overlaysEffects, overlaysService } = setup();
        let tmp = <Overlay[]>[];
        overlays.forEach(i => tmp.push(Object.assign({}, i,{date :i.photoTime})));
        const expectedResult = new LoadOverlaysSuccessAction(tmp);

        overlaysService.fetchData.and.returnValue(Observable.of(overlays));

        runner.queue(new LoadOverlaysAction());

        let result = null;
        overlaysEffects.loadOverlays$.subscribe(_result => {
            result = _result;
        });



        expect(result).toEqual(expectedResult);

    });
});
