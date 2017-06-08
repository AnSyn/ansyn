import { BaseDataSourceFacade } from '../models/base-data-source-facade.model';
import { Injectable, Inject} from '@angular/core';


export interface ISourceFacadeContainer{
	/**
	 * register
	 * dataSourceFacade : BaseDataSourceFacade : void
	 */
	register(type : Function ,dataSourceFacade: BaseDataSourceFacade): void;

	unregister(facadeType : Function , sourceType ?:string) :void;

	resolve(facadeType : Function) : Array<BaseDataSourceFacade> ;
	
	resolve(facadeType : Function , sourceType :string) : Array<BaseDataSourceFacade>;
}

@Injectable()
export class SourceFacadeContainerService implements ISourceFacadeContainer {


	private _sourceFacades: Map<Function,Map<string,BaseDataSourceFacade>>;

	constructor(@Inject(BaseDataSourceFacade) _dataSourceFacade: BaseDataSourceFacade[]) {
		this._sourceFacades = new Map<Function,Map<string,BaseDataSourceFacade>>();
		if (!_dataSourceFacade) {
			console.log("Non facades were provide: Empty or undefined ");
			return;
		}
		_dataSourceFacade.forEach(sourceFacade => {
			this.register(sourceFacade.type,sourceFacade);
		});
	}

	public register(type : Function , dataSourceFacade: BaseDataSourceFacade): void{
		let typesFacades = this._sourceFacades.get(type);
		if (!typesFacades || typesFacades == null){
			typesFacades = new Map<string,BaseDataSourceFacade>();
			this._sourceFacades.set(type,typesFacades);
		}
		typesFacades.set(dataSourceFacade.sourceType,dataSourceFacade);
	}

	public unregister(facadeType : Function , sourceType ?:string): void {
		let typesFacades = this._sourceFacades.get(facadeType);
		if (typesFacades && typesFacades != null ){
			typesFacades.delete(sourceType);
		}
		
	}

	public resolve(facadeType : Function , sourceType ?:string): Array<BaseDataSourceFacade> {
		let typesFacades = this._sourceFacades.get(facadeType);
		if (!typesFacades || typesFacades == null){
			return null;
		}
		if (!sourceType || sourceType == null ){
			const result : Array<BaseDataSourceFacade> = new Array();
			for (let value of typesFacades.values()) {
				result.push(value);
			}
			return result ;
		}
		const res = typesFacades.get(sourceType);
		return res ? [res] : [] ;
	}
}
