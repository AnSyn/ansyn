import { Injectable } from '@angular/core';
import {
	filtersMap,
	ICaseFacetsState, ICaseFilter,
	ICaseMapState,
	ICompressedCaseFacetsState,
	ICompressedCaseFilter,
	ICompressedCaseMapsState,
	ICompressedCaseMapState, ICompressedImageManualProcessArgs,
	IDilutedCaseMapsState, ImageManualProcessArgs,
} from '../../models/case.model';
import { FilterType } from '../../../../filters/models/filter-type';

@Injectable({
	providedIn: 'root'
})
export class QueryCompressorService {

	constructor() {
	}

	compressManualImageProcessingData(imageManualProcessArgs: ImageManualProcessArgs): ICompressedImageManualProcessArgs {
		return {
			b: imageManualProcessArgs.Brightness,
			c: imageManualProcessArgs.Contrast,
			g: imageManualProcessArgs.Gamma,
			sa: imageManualProcessArgs.Saturation,
			sh: imageManualProcessArgs.Sharpness,
		}
	}

	decompressManualImageProcessingData(compressedImageManualProcessArgs: ICompressedImageManualProcessArgs): ImageManualProcessArgs {
		return {
			Brightness: compressedImageManualProcessArgs.b,
			Contrast: compressedImageManualProcessArgs.c,
			Gamma: compressedImageManualProcessArgs.g,
			Saturation: compressedImageManualProcessArgs.sa,
			Sharpness: compressedImageManualProcessArgs.sh,
		}
	}

	compressMapsData(mapData: IDilutedCaseMapsState): ICompressedCaseMapsState {
		const compressedMapData: ICompressedCaseMapsState = {
			id: mapData.activeMapId,
			d: [],
			l: mapData.layout
		};
		mapData.data.forEach((caseMapState: ICaseMapState) => {
			const compressedState: ICompressedCaseMapState = {
				id: caseMapState.id,

				d: {
					p: {
						e: {
							c: caseMapState.data.position.extentPolygon.coordinates,
							t: caseMapState.data.position.extentPolygon.type,
						},
						p: {
							c: caseMapState.data.position.projectedState.center,
							p: {
								c: caseMapState.data.position.projectedState.projection.code
							},
							re: caseMapState.data.position.projectedState.resolution,
							ro: caseMapState.data.position.projectedState.rotation,
							z: caseMapState.data.position.projectedState.zoom
						}
					},
					o: null,
					man: this.compressManualImageProcessingData(caseMapState.data.imageManualProcessArgs),
					auto: caseMapState.data.isAutoImageProcessingActive
				},
				f: caseMapState.flags,
				o: caseMapState.orientation,
				w: {
					map: caseMapState.worldView.mapType,
					source: caseMapState.worldView.sourceType
				}
			};

			if (caseMapState.data.overlay) {
				compressedState.d.o = {
					id: caseMapState.data.overlay.id,
					s: caseMapState.data.overlay.sourceType
				};
			}
			compressedMapData.d.push(compressedState);
		});

		return compressedMapData;
	}

	decompressMapData(mapData): IDilutedCaseMapsState {
		if (mapData) {
			const decompressedMapData: IDilutedCaseMapsState = {
				activeMapId: mapData.id,
				data: [],
				layout: mapData.l
			};

			mapData.d.forEach((shortMapData: ICompressedCaseMapState) => {
				const decompressed: ICaseMapState = {
					id: shortMapData.id,
					data: {
						position: {
							extentPolygon: {
								coordinates: shortMapData.d.p.e.c,
								type: shortMapData.d.p.e.t,
							},
							projectedState: {
								center: shortMapData.d.p.p.c,
								projection: {
									code: shortMapData.d.p.p.p.c
								},
								resolution: shortMapData.d.p.p.re,
								rotation: shortMapData.d.p.p.ro,
								zoom: shortMapData.d.p.p.z,
							}
						},
						overlay: null,
						imageManualProcessArgs: this.decompressManualImageProcessingData(shortMapData.d.man),
						isAutoImageProcessingActive: shortMapData.d.auto
					},
					flags: shortMapData.f,
					orientation: shortMapData.o,
					worldView: {
						mapType: shortMapData.w.map,
						sourceType: shortMapData.w.source
					}
				};

				if (shortMapData.d.o) {
					decompressed.data.overlay = <any>{
						id: shortMapData.d.o.id,
						sourceType: shortMapData.d.o.s
					};
				}
				decompressedMapData.data.push(decompressed);
			});

			return decompressedMapData;
		}
	}

	compressFacets(facets: ICaseFacetsState): ICompressedCaseFacetsState {
		const compressedFacets: ICompressedCaseFacetsState = {
			f: [],
			fav: facets.showOnlyFavorites
		};

		facets.filters.forEach((filter: any) => {
			const compressedFilter: ICompressedCaseFilter = {
				f: filtersMap.get(filter.fieldName),
				m: filter.metadata,
				t: filter.type
			};

			if (filter.type === FilterType.Enum) {
				compressedFilter.m = {
					dis: filter.metadata.disabledEnums,
					un: filter.metadata.unCheckedEnums,
				};
			}

			compressedFacets.f.push(compressedFilter);
		});

		return compressedFacets;
	}

	decompressFacets(compressedFacets: ICompressedCaseFacetsState): ICaseFacetsState {
		if (compressedFacets) {
			const decompressedFacets: ICaseFacetsState = {
				filters: [],
				showOnlyFavorites: compressedFacets ? compressedFacets.fav : false,
			};

			compressedFacets.f.forEach((filter: any) => {
				const decompressedFilter: ICaseFilter = {
					fieldName: this.getKeyByValue(filter.fieldName),
					metadata: filter.m,
					type: filter.t
				};

				if (filter.t === FilterType.Enum) {
					decompressedFilter.metadata = {
						disabledEnums: filter.m.dis,
						unCheckedEnums: filter.m.um,
					};
				}

				decompressedFacets.filters.push(decompressedFilter);
			});

			return decompressedFacets;
		}
	}

	getKeyByValue(value) {
		return Object.keys(filtersMap).find(key => filtersMap[key] === value);
	}


}
