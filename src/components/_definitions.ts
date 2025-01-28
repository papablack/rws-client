import RWSViewComponent, { IWithCompose } from './_component';
import RWSWindow, { RWSWindowComponentInterface, loadRWSRichWindow } from '../types/RWSWindow';
import { ElementStyles, ViewTemplate } from '@microsoft/fast-element';

export interface IFastDefinition {
    name: string;
    template: ViewTemplate;
    styles?: ElementStyles;
}

export function isDefined<T extends RWSViewComponent>(element: IWithCompose<T>): boolean {
    const richWindow: RWSWindow = loadRWSRichWindow();

    if (!element.definition) {
        return false;
    }

    return Object.keys(richWindow.RWS.components).includes(element.definition.name);
}

export function defineComponent<T extends RWSViewComponent>(element: IWithCompose<T>): void {
    if (element.isDefined()) {
        if (element._verbose) {
            console.warn(`Component ${element.name} is already declared`);
        }

        return;
    }

    const richWindow = loadRWSRichWindow();

    if (!element.definition) {
        throw new Error('RWS component is not named. Add `static definition = {name, template};`');
    }

    const composedComp = element.compose({
        baseName: element.definition.name,
        template: element.definition.template,
        styles: element.definition.styles
    }) as RWSWindowComponentInterface;

    if (!richWindow.RWS) {
        throw new Error('RWS client not initialized');
    }

    element.sendEventToOutside<string>(element._EVENTS.component_define, element.definition.name);

    richWindow.RWS.components[element.definition.name] = {
        interface: composedComp,
        component: element
    };
}

export function getDefinition(tagName: string, htmlTemplate: ViewTemplate, styles: ElementStyles = null) {
    const def: IFastDefinition = {
        name: tagName,
        template: htmlTemplate
    };

    if (styles) {
        def.styles = styles;
    }

    return def;
}