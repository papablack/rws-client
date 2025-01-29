import { Accessor, Observable } from "@microsoft/fast-element";
import { ExtendedObservableAccessor } from "./_extended_accessor";

export class ExternalObservableAccessor extends ExtendedObservableAccessor {

    constructor(public name: string, protected customGet: (source: any, field: string) => any = null, protected customSet: (source: any, field: string, newVal: any) => boolean | void = null, protected watcher: any = void 0) {
        super(name, customGet, customSet, watcher, '');        
    }
}