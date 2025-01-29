export type RWSViteConfig = {
    dev: boolean;
    entry: string;
    tsConfigPath: string;
    outDir: string;
    cssOutputPath: string;   
    outFileName?: string; 
    defines?: {
        [key: string]: string
    };
}