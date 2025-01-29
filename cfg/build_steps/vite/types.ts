export type RWSViteConfig = {
    dev: boolean;
    entry: string;
    cssOutputPath?: string;
    tsConfigPath: string;
    defines?: {
        [key: string]: string
    };
}