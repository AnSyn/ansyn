
export interface ISourceProvider {
    mapType : string;
    sourceType :  string;
    create(metaData : any) : any;
}


