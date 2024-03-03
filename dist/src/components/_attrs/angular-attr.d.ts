import { DecoratorAttributeConfiguration } from '@microsoft/fast-element';
import RWSViewComponent from '../_component';
type TargetType = RWSViewComponent;
declare function ngAttr(configOrTarget?: DecoratorAttributeConfiguration | TargetType, prop?: string): void | any;
export { ngAttr };
