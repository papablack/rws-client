interface RWSDecoratorOptions{
    template?: string,
    styles?: string,
    fastElementOptions?: any,
    ignorePackaging?: boolean
}

function RWSView(name: string, data?: RWSDecoratorOptions): (type: any) => void
{
    return () => {};
}

function RWSIgnore(params: { mergeToApp?: boolean } = null): () => void
{
    return () => {};
}

export default RWSView;

export { RWSDecoratorOptions, RWSIgnore }