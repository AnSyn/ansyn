export enum ISceneMode {
	COLUMBUS_VIEW = 'COLUMBUS_VIEW',
	MORPHING = 'MORPHING',
	SCENE2D = 'SCENE2D',
	SCENE3D = 'SCENE3D'
}

export class CesiumLayer {

	propeties: Map<any, any>;

	constructor(public layer: any,
				public mapProjection: any = null,
				public terrainProvider: any = null,
				public sceneMode: ISceneMode = ISceneMode.SCENE3D,
				public removePrevLayers = false) {
		this.propeties = new Map<any, any>();
	}

	get(key) {
		return this.propeties.get(key);
	}

	set(key, value) {
		this.propeties.set(key, value);
	}

	delete(key) {
		this.propeties.delete(key);
	}
}
