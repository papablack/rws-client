export type RWSViteConfig = {
    dev: boolean
    tsConfigPath: string
    defines?: {
        [key: string]: string
    }
}