export interface IRWSViteLoader {
    name: string,
    transform(code: string, id: string): Promise<{ code: string, map: any } | null>
}