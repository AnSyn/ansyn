import { BaseDataSourceFacade } from "./base-data-source-facade.model";

export abstract class BaseOverlayDataSourceFacade extends BaseDataSourceFacade {
    get(query : any) : any{};
    constructor(){
        super(BaseOverlayDataSourceFacade);
    }
}