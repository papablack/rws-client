// custom-typings.d.ts
declare module 'glob' {
    import { Minimatch } from 'minimatch';

    namespace glob {
        interface IOptions {
            // Add only the options you need or leave it empty to bypass the error
        }

        interface IGlobBase {
            minimatch: Minimatch;
            options: IOptions;
        }
    }
}
