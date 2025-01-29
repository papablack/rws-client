import { Observable, Accessor } from "@microsoft/fast-element";

export abstract class ExtendedObservableAccessor implements Accessor {
    protected field: string;
    protected callback: string;  

    constructor(public name: string, protected customGet: (source: any, field: string) => any = null, protected customSet: (source: any, field: string, newVal: any) => boolean | void = null, protected watcher: any = void 0, suffix: string = 'Changed') {
        this.field = `_${name}`;
        this.callback = `${name}${suffix}`;
    }

    getValue(source: any): any {
        Observable.track(source, this.name);

        return this.customGet ? this.customGet(source, this.field) : source[this.field];
    }

    setValue(source: any, newValue: any): void {
        if(this.customSet){
            if(this.customSet(source, this.field, newValue) === false){
                return;
            };            
        }
        
        const field = this.field;
        const oldValue = source[field];

        if (oldValue !== newValue) {
            source[field] = newValue;

            const callback = source[this.callback];

            if (typeof callback === 'function') {
                callback.call(source, oldValue, newValue);
            }

            Observable.getNotifier(source).notify(this.name);
        }
    }
    
}