import { Accessor, Observable } from "@microsoft/fast-element";
import { ExtendedObservableAccessor } from "./_extended_accessor";

export class ExternalObservableAccessor extends ExtendedObservableAccessor {

    constructor(public name: string, protected watcher: any = void 0) {  
        super(name, watcher , '');
    }
}