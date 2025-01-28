export type RWSViteConfig = {
    dev: boolean
    cssOutputPath?: string,
    tsConfigPath: string
    defines?: {
        [key: string]: string
    }
}