import { RegisterOptions } from '../models/register-options.model';
import { Type } from '../models/type.model';
import { Inject, Injectable } from '@angular/core';


export interface ITypeContainer {
	register(abstractType: Function, classTypeToResolve: Type, name?: string): void;

	unregister(baseType: Function, registeredType ?: Type, name ?: string): void

	resolve(abstractType: Function): Array<any> ;

	resolve(abstractType: Function, name: string): any;
}

@Injectable()
export class TypeContainerService implements ITypeContainer {

	private _namelessRegisteredTypes: Map<Function, Set<Type>>;
	private _namedRegisteredTypes: Map<Function, Map<string, Type>>;
	private _namelessResolvedTypes: Map<Function, Map<Type, any>>;
	private _namedResolvedTypes: Map<Function, Map<string, any>>;


	constructor(@Inject(RegisterOptions) registerOptions: RegisterOptions[]) {
		this._namelessRegisteredTypes = new Map<Function, Set<Type>>();
		this._namelessResolvedTypes = new Map<Function, Map<Type, any>>();
		this._namedRegisteredTypes = new Map<Function, Map<string, Type>>();
		this._namedResolvedTypes = new Map<Function, Map<string, any>>();

		registerOptions.forEach(option => {
			this.register(option.baseType, option.type, option.name);
		});
	}

	public register(abstractType: Function, classTypeToResolve: Type, name?: string) {
		if (!name || name == null) {
			this.registerNameless(abstractType, classTypeToResolve);
		} else {
			this.registerByName(abstractType, classTypeToResolve, name);
		}
	}

	private registerNameless(abstractType: Function, classTypeToResolve: Type) {
		let abstractTypeSet = this._namelessRegisteredTypes.get(abstractType);
		if (!abstractTypeSet || abstractTypeSet == null) {
			abstractTypeSet = new Set<Type>();
			this._namelessRegisteredTypes.set(abstractType, abstractTypeSet);
		}
		if (!abstractTypeSet.has(classTypeToResolve)) {
			abstractTypeSet.add(classTypeToResolve);
		}
	}

	private registerByName<T extends Function>(abstractType: Function, classTypeToResolve: Type, name?: string) {
		let abstractTypeNameClasses = this._namedRegisteredTypes.get(abstractType);
		if (!abstractTypeNameClasses || abstractTypeNameClasses == null) {
			abstractTypeNameClasses = new Map<string, Type>();
			this._namedRegisteredTypes.set(abstractType, abstractTypeNameClasses);
		}

		if (abstractTypeNameClasses.has(name)) {
			throw new Error('Name with the same type al ready registered');
		}
		abstractTypeNameClasses.set(name, classTypeToResolve);
		this.registerNameless(abstractType, classTypeToResolve);
	}

	public unregister(baseType: Function, registeredType ?: Type, name ?: string): void {
		if (!name || name == null) {
			this.unregisterNameless(baseType, registeredType);
		}
		this.unregisterByName(baseType, name);
	}

	private unregisterNameless(baseType: Function, registeredType: Type): void {
		const namelessType = this._namelessRegisteredTypes.get(baseType);
		if (!namelessType || namelessType == null) {
			return;
		}
		namelessType.delete(registeredType);
		const namelessResolved = this._namelessResolvedTypes.get(baseType);
		if (!namelessResolved || namelessResolved == null) {
			return;
		}
		namelessResolved.delete(registeredType);
	}

	private unregisterByName(baseType: Function, name ?: string) {
		const namedType = this._namedRegisteredTypes.get(baseType);
		if (!namedType || namedType == null) {
			return;
		}
		namedType.delete(name);
		const namedResolved = this._namedResolvedTypes.get(baseType);
		if (!namedResolved || namedResolved == null) {
			return;
		}
		namedResolved.delete(name);
	}

	public resolve(abstractType: Function, name ?: string): any {
		if (!name || name == null) {
			return this.resolveNameless(abstractType);
		}
		return this.resolveByName(abstractType, name);
	}

	private resolveNameless(abstractType: Function): Array<any> {

		let classesToResolve = this._namelessRegisteredTypes.get(abstractType);
		let resolvedClasses = this._namelessResolvedTypes.get(abstractType);
		if (!resolvedClasses || resolvedClasses == null) {
			resolvedClasses = new Map<Type, any>();
			this._namelessResolvedTypes.set(abstractType, resolvedClasses);
		}
		if (!classesToResolve || classesToResolve == null) {
			return [];
		}

		return Array.from(classesToResolve).map(type => {
			let entity = resolvedClasses.get(type);
			if (!entity || entity == null) {
				entity = new type();
				resolvedClasses.set(type, entity);
			}

			return entity;
		});
	}

	private resolveByName(abstractType: Function, name: string): any {
		const namedTypes = this._namedRegisteredTypes.get(abstractType);
		if (!namedTypes || namedTypes == null) {
			//throw "type:" + abstractType + "was not registered";
			return null;
		}
		let typeToResolve = namedTypes.get(name);
		if (!typeToResolve || typeToResolve == null) {
			//throw "type:" + abstractType + "was not registered with name" + name;
			return null;
		}
		let resolvedNamedClass = this._namedResolvedTypes.get(abstractType);
		if (!resolvedNamedClass || resolvedNamedClass == null) {
			resolvedNamedClass = new Map<string, Function>();
			this._namedResolvedTypes.set(abstractType, resolvedNamedClass);
		}
		let result = resolvedNamedClass.get(name);
		if (!result || result == null) {
			result = new typeToResolve();
			resolvedNamedClass.set(name, result);
		}
		return result;
	}
}


