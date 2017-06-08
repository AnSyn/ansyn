export abstract class BaseDataSourceFacade{
      sourceType : string;
      private _type : Function;
      protected constructor(type : Function){
            this._type = type;
      }
      
      public get type() : Function {
            return this._type;
      }
      
}
