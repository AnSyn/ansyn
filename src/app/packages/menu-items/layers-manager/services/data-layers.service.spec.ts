import { ILayerTreeNode } from '../models/layer-tree-node';
import { IServerDataLayerContainerRoot } from '../models/server-data-layer-container-root';
import { TestBed, inject, fakeAsync, tick, async } from '@angular/core/testing';
import { HttpModule, Http, Headers, RequestOptions } from "@angular/http";
import { DataLayersService, LayerRootsBundle } from './data-layers.service';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';

describe('DataLayersService', () => {
    let dataLayersService: DataLayersService;
    let http: Http;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpModule],
            providers: [DataLayersService]
        });
    });

    beforeEach(inject([DataLayersService, Http], (_dataLayersService: DataLayersService, _http: Http) => {
        dataLayersService = _dataLayersService;
        http = _http;
    }));

    it('should ...', inject([DataLayersService], (service: DataLayersService) => {
        expect(service).toBeTruthy();
    }));

    it('getAllLayersInATree should send the case id in a get request', () => {
        let serverResponse = {
            json: () => [
                {
                    "id": "layersContainerId_1234",
                    "name": "Roads",
                    "type": "Static",
                    "dataLayerContainers": [
                        {
                            "id": "layersContainerId_1234",
                            "name": "New York Roads",
                            "dataLayerContainers": [],
                            "dataLayers": [
                                {
                                    "id": "layerId_1234",
                                    "name": "Upper east side roads",
                                    "isChecked": true
                                }
                            ]
                        }
                    ],
                    "dataLayers": [
                        {
                            "id": "layerId_1234",
                            "name": "New York Roads",
                            "isChecked": true
                        }
                    ]
                }
            ]
        };

        spyOn(http, 'get').and.returnValue(Observable.of(new Response(serverResponse)));
        dataLayersService.getAllLayersInATree('caseId');
        expect(http.get).toHaveBeenCalledWith(`${dataLayersService.baseUrl}/caseId/layers`);
    });
});
