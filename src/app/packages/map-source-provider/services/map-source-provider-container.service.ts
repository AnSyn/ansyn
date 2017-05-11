import {ISourceProvider} from '../models/models';
import {Injectable,Inject,OpaqueToken} from '@angular/core';

export const sourceMapProviders : OpaqueToken = new OpaqueToken('source-map-provides');

export interface IMapSourceProviderContainer{
    /**
     * register
     * sourceProvider : ISourceProvider : void    
    */
    register(sourceProvider : ISourceProvider) : void;
    
    unregister(mapType : string ,sourceType : string) : void;
    
    resolve(mapType : string ,sourceType : string) : ISourceProvider;
}

@Injectable()
export class MapSourceProviderContainerService implements IMapSourceProviderContainer {
   

    private _sourceProvides : Map<string,ISourceProvider>;

    constructor(@Inject(sourceMapProviders) private  sourceMapProviders : ISourceProvider[]) {
        this._sourceProvides = new Map<string,ISourceProvider>();
        if (!sourceMapProviders) {
            console.info("Non providers were provide: Empty or undefined ");
            return;
        }
        sourceMapProviders.forEach(sourceProvider => {
            this.register(sourceProvider);
        });
    }

    public register(sourceProvider : ISourceProvider) : void{
        this._sourceProvides.set([sourceProvider.mapType,sourceProvider.sourceType].join(','),sourceProvider);
    }

    public unregister(mapType: string, sourceType: string): void {
        this._sourceProvides.delete([mapType,sourceType].join(','));
    }
    
    public resolve(mapType : string , sourceType : string) : ISourceProvider {
        return this._sourceProvides.get([mapType,sourceType].join(','));
    }
}
