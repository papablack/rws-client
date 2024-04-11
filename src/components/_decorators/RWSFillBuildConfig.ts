import { Key } from '@microsoft/fast-foundation';

import 'reflect-metadata';
import IRWSConfig from '../../interfaces/IRWSConfig';

type FillBuildDecoratorReturnType = (target: any, key?: string | number | undefined, parameterIndex?: number) => void;

function RWSFillBuildConfig(dependencyClass: Key): FillBuildDecoratorReturnType {
    return (target: IRWSConfig, key?: string | number, parameterIndex?: number) => {
        console.log('ONBUILD', target, key, parameterIndex);
    };
}

export { RWSFillBuildConfig }