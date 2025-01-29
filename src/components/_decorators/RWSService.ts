import RWSViewComponent from '../_component';

interface RWSServiceDecoratorOptions {
    _vars?: any
}

function RWSService<T extends RWSViewComponent>(options?: RWSServiceDecoratorOptions): (type: any) => void {
    return (constructor: T) => {
    };
}

export { RWSService };