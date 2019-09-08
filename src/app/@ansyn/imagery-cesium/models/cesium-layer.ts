export enum ISceneMode {
	COLUMBUS_VIEW = 'COLUMBUS_VIEW',
	MORPHING = 'MORPHING',
	SCENE2D = 'SCENE2D',
	SCENE3D = 'SCENE3D'
}

export class CesiumLayer {
	constructor(public layer: any,
				public mapProjection: any = null,
				public terrainProvider: any = null,
				public sceneMode: ISceneMode = ISceneMode.SCENE3D,
				public removePrevLayers = false) {

	}
}
