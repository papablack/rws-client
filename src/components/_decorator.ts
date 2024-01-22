interface RWSDecoratorOptions{
    template?: string,
    styles?: string,
    fastElementOptions?: any
}

function RWSView(name: string, data?: RWSDecoratorOptions): (type: Function) => void{
    return () => {}
}

export default RWSView;