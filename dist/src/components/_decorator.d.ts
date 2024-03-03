interface RWSDecoratorOptions {
    template?: string;
    styles?: string;
    fastElementOptions?: any;
}
declare function RWSView(name: string, data?: RWSDecoratorOptions): (type: any) => void;
export default RWSView;
export { RWSDecoratorOptions };
