import { DesignSystem } from '@microsoft/fast-foundation';


export function provideRWSDesignSystem(element?: HTMLElement): DesignSystem {
    return DesignSystem.getOrCreate(element);
}