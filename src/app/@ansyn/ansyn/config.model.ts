import { ICasesConfig, IFiltersConfig, IToolsConfig } from "@ansyn/menu-items";
import { ILayersManagerConfig } from "../menu-items/layers-manager/models/layers-manager-config";
import { IOverlaysConfig } from "../overlays/models/overlays.config";
import { IMapFacadeConfig } from "@ansyn/map-facade";
import { ICoreConfig, ILoggerConfig, IMapSourceProvidersConfig } from "@ansyn/core";
import { IContextConfig } from "../context/models/context.config.model";
import { IStatusBarConfig } from "@ansyn/status-bar";
import { IMenuConfig } from "../menu/models/menu-config.model";
import { ILoginConfig } from "../../app/login/models/login.config";
import { IVisualizersConfig } from "@ansyn/imagery";
import { IOpenAerialOverlaySourceConfig } from "./app-providers/overlay-source-providers/open-aerial-source-provider";
import { IImisightOverlaySourceConfig } from "../../app/imisight/imisight.model";
import { IPlanetOverlaySourceConfig } from "./app-providers/overlay-source-providers/planet/planet-source-provider";
import { IAuth0Config } from "../../app/imisight/auth0.service";
import { IIdahoOverlaySourceConfig } from "./app-providers/overlay-source-providers/idaho-source-provider";
import { IMultipleOverlaysSourceConfig } from "../overlays/services/multiple-source-provider";

export interface IConfigModel {
	casesConfig: ICasesConfig,
	layersManagerConfig: ILayersManagerConfig,
	overlaysConfig: IOverlaysConfig,
	mapFacadeConfig: IMapFacadeConfig,
	mapSourceProvidersConfig: IMapSourceProvidersConfig,
	filtersConfig: IFiltersConfig,
	contextConfig: IContextConfig,
	toolsConfig: IToolsConfig,
	loggerConfig: ILoggerConfig,
	statusBarConfig: IStatusBarConfig,
	coreConfig: ICoreConfig,
	menuConfig: IMenuConfig,
	loginConfig: ILoginConfig,
	visualizersConfig: IVisualizersConfig,
	multipleOverlaysSourceConfig: IMultipleOverlaysSourceConfig,
	idahoOverlaysSourceConfig: IIdahoOverlaySourceConfig,
	openAerialOverlaysSourceConfig: IOpenAerialOverlaySourceConfig,
	imisightOverlaysSourceConfig: IImisightOverlaySourceConfig,
	planetOverlaysSourceConfig: IPlanetOverlaySourceConfig,
	auth0Config: IAuth0Config,
	ORIENTATIONS: string[]
}
