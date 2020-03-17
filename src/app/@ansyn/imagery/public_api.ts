export { IMapSource } from './model/map-providers-config';
export { IStroke, IIcon } from './model/visualizers/visualizer-style';

export { ICanvasExportData } from './model/base-imagery-map';
export {
	ImageryMapExtent, ImageryMapExtentPolygon, ImageryMapProjectedState, ImageryMapPosition, IMousePointerMove
}from './model/case-map-position.model';

export { MAP_SOURCE_PROVIDERS_CONFIG, IMapSourceProvidersConfig } from './model/base-map-source-provider';
export { MarkerSizeDic } from './model/visualizers/visualizer-style';
export { IVisualizerEntity } from './model/visualizers/visualizers-entity';
export { MarkerSize } from './model/visualizers/visualizer-style';
export { IVisualizerStyle } from './model/visualizers/visualizer-style';
export { IVisualizerStateStyle } from './model/visualizers/visualizer-state';
export { VisualizerStates } from './model/visualizers/visualizer-state';
export { IMapProgress, IMapErrorMessage } from './model/map-progress.model';
export {
	IMapProviderConfig,
	IMapProvidersConfig,
	MAP_PROVIDERS_CONFIG
} from './model/map-providers-config';
export { ImageryMapSources } from './providers/map-source-providers';
export { IMapInstanceChanged } from './communicator-service/communicator.entity';
export { IBaseMapSourceProviderConstructor } from './model/base-map-source-provider';
export { VisualizerInteractions } from './model/base-imagery-visualizer';
export { IBaseImageryMapConstructor } from './model/base-imagery-map';
export {
	createImageryMapsCollection,
	IMAGERY_MAPS,
	IMAGERY_MAPS_COLLECTIONS,
	ImageryMapsFactory, ImageryMapsProvider
} from './providers/imagery-map-collection';
export {
	areCoordinatesNumeric,
	bboxFromGeoJson,
	polygonFromBBOX,
	geojsonMultiPolygonToFirstPolygon,
	geojsonMultiPolygonToBBOXPolygon,
	geojsonMultiPolygonToPolygons,
	geojsonPolygonToMultiPolygon,
	getPointByGeometry,
	getPolygonByPoint,
	getPolygonByPointAndRadius,
	getPolygonByBufferRadius,
	getPolygonIntersectionRatio,
	polygonsDontIntersect,
	isPointContainedInGeometry,
	unifyPolygons,
	calculateLineDistance,
	calculateGeometryArea,
	getDistanceBetweenPoints,
	EPSG_4326,
	EPSG_3857
} from './utils/geo';

export { IVisualizersConfig, VisualizersConfig } from './model/visualizers-config.token';
export { ImageryVisualizer } from './decorators/imagery-visualizer';
export { BaseImageryPlugin, IImageryPluginMetaData } from './model/base-imagery-plugin';
export {
	BaseImageryVisualizer,
	IBaseImageryVisualizerClass,
	IImageryVisualizerMetaData, VisualizerInteractionTypes
} from './model/base-imagery-visualizer';
export { ImageryPlugin } from './decorators/imagery-plugin';
export { ImageryMap } from './decorators/imagery-map';
export { ImageryMapSource } from './decorators/map-source-provider';
export { BaseImageryMap } from './model/base-imagery-map';
export { BaseMapSourceProvider } from './model/base-map-source-provider';
export { CacheService } from './cache-service/cache.service';
export { ImageryCommunicatorService } from './communicator-service/communicator.service';
export { CommunicatorEntity } from './communicator-service/communicator.entity';
export { ProjectionService } from './projection-service/projection.service';
export { StayInImageryService } from './stay-in-imagery-service/stay-in-imagery.service';
export { ImageryModule } from './imagery.module';
export { IMAGERY_CONFIG } from './model/configuration.token';
export { ImageryLayerProperties, IMAGERY_MAIN_LAYER_NAME, IMAGERY_BASE_MAP_LAYER } from './model/imagery-layer.model';

export { IMapSettings, IMapSettingsData, IWorldViewMapState } from './model/map-settings';
export { toDegrees, toRadians, getAngleDegreeBetweenPoints } from './utils/math';
export { ExtentCalculator } from './utils/extent-calculator';
