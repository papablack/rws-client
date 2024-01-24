interface RWSDecoratorOptions {
    template?: string;
    styles?: string;
    fastElementOptions?: any;
}
declare function RWSView(name: string, data?: RWSDecoratorOptions): (type: Function) => void;
export default RWSView;
