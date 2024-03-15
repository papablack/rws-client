import { Observable } from "@microsoft/fast-element";
import DOMServiceInstance, { DOMService } from "../services/DOMService";

interface RWSDecoratorOptions{
    template?: string,
    styles?: string,
    fastElementOptions?: any
}

function RWSView(name: string, data?: RWSDecoratorOptions): (type: any) => void{
    return () => {};
}

export default RWSView;

export { RWSDecoratorOptions }