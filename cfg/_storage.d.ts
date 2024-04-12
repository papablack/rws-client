interface Storage {
    _loaded: boolean;
    data: {
        [key: string]: any;
    };
}

declare const _STORAGE: Readonly<Storage>;

declare function get(key: string): any | null;
declare function getAll(): any;
declare function init(json: any): void;
declare function has(key: string): boolean;
declare function isLoaded(): boolean;

export {
    get,
    getAll,
    has,
    init,
    isLoaded
};
