import { Observable, AttributeConfiguration } from '@microsoft/fast-element';
function ngAttr(configOrTarget, prop) {
    if (arguments.length > 1) {
        // Decorator used directly without factory invocation
        // Apply the decorator immediately without returning anything
        applyDecorator(configOrTarget, prop);
    }
    else {
        // Decorator factory invocation
        const config = configOrTarget;
        // Return a function that applies the decorator, conforming to TypeScript's expectations for decorator factories
        return (target, property) => applyDecorator(target, property, config);
    }
}
function applyDecorator(target, prop, config = {}) {
    if (arguments.length > 1) {
        config.property = prop;
    }
    AttributeConfiguration.locate(target.constructor).push(config);
    modifyPropertyDescriptor(target, prop);
}
function modifyPropertyDescriptor(target, propertyKey) {
    const privatePropName = `_${String(propertyKey)}`;
    Object.defineProperty(target, privatePropName, {
        writable: true,
        value: target[propertyKey],
    });
    Object.defineProperty(target, propertyKey, {
        get() {
            const value = this[privatePropName];
            return isNgValue(value) ? null : value;
        },
        set(value) {
            if (typeof value === 'string' && isNgValue(value)) {
                this[privatePropName] = null; // Set to null if condition is met
            }
            else {
                this[privatePropName] = value;
            }
            Observable.notify(this, propertyKey);
        },
    });
}
function isNgValue(input) {
    // Regular expression to match AngularJS template variable notation
    const angularJsVariablePattern = /\{\{([^}]+)\}\}/;
    // Test the input string for the pattern and return the result
    return angularJsVariablePattern.test(input);
}
export { ngAttr };
//# sourceMappingURL=angular-attr.js.map