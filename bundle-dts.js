var dts = require('dts-bundle');

dts.bundle({
    name: 'rws-js-client',
    main: 'dist/src/index.ts',
    out: 'bundle.d.ts', // relative to 'main'
    // removeSource: true, // Optional: removes the source .d.ts files
    // outputAsModuleFolder: true // to use with node resolve algorithm
});