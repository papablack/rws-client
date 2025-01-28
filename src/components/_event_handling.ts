import RWSViewComponent from './_component';

export function on<T>(this: RWSViewComponent, type: string, listener: (event: CustomEvent<any>) => any) {
    this.addEventListener(type, (baseEvent: Event) => {
        listener(baseEvent as CustomEvent<T>);
    });
}

export function $emitDown<T>(this: RWSViewComponent, eventName: string, payload: T) {
    this.$emit(eventName, payload, {
        bubbles: true,
        composed: true
    });
}

export function observe(this: RWSViewComponent, callback: (component: RWSViewComponent, node: Node, observer: MutationObserver) => Promise<void>, condition: (component: RWSViewComponent, node: Node) => boolean = null, observeRemoved: boolean = false)
{
    const observer = new MutationObserver((mutationsList, observer) => {
        for(const mutation of mutationsList) {
            if (mutation.type === 'childList') {
                const mutationObserveType: NodeList = observeRemoved ? mutation.removedNodes : mutation.addedNodes;
                mutationObserveType.forEach(node => {                    
                    if ((condition !== null && condition(this, node))) {
                        callback(this, node, observer);
                    }else if(condition === null){
                        callback(this, node, observer);
                    }                    
                });
            }
        }
    });
    
    observer.observe(this.getShadowRoot(), { childList: true, subtree: true });
}

export function sendEventToOutside<T>(eventName: string, data: T): void
{
    document.dispatchEvent(new CustomEvent<T>(eventName, {
        detail: data,
    }));
}