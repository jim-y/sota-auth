import { join } from 'path';
import { controllerPrefix, routesSymbol } from './decorator-symbols';

// @ts-ignore
Symbol.metadata ??= Symbol('Symbol.metadata');

export type ModuleOptions = {
    prefix?: string;
    inheritPrefix?: boolean;
    controllers?: any[];
    services?: any[];
    modules?: any[];
};

export type ModuleMeta = {
    prefix: ModuleOptions['prefix'];
    inheritPrefix: ModuleOptions['inheritPrefix'];
};

export function _httpMethodDecoratorFactory(path, method) {
    return function (originalMethod: any, context) {
        const methodName = context.name;
        const route = { method, path, action: methodName };

        if (!context.metadata[routesSymbol]) {
            context.metadata[routesSymbol] = {};
        }

        const routeMeta = context.metadata[routesSymbol][methodName];

        if (!routeMeta) {
            context.metadata[routesSymbol][methodName] = route;
        } else {
            context.metadata[routesSymbol][methodName] = {
                ...routeMeta,
                ...route,
            };
        }
        return originalMethod;
    };
}

export function _add(originalMethod: any, context, property, value: any) {
    const methodName = context.name;

    if (!context.metadata[routesSymbol]) {
        context.metadata[routesSymbol] = {};
    }

    const routeMeta = context.metadata[routesSymbol][methodName];

    if (!routeMeta) {
        context.metadata[routesSymbol][methodName] = { [property]: value };
    } else {
        context.metadata[routesSymbol][methodName] = {
            ...routeMeta,
            [property]: value,
        };
    }

    return originalMethod;
}

export function _addToRoute(property, value: any) {
    return function (originalMethod: any, context) {
        return _add(originalMethod, context, property, value);
    };
}

export function getRoutesForController(controller, modulePrefix) {
    const routes = [];
    const controllerName = controller.constructor.name;
    const metadata = controller.constructor[Symbol.metadata];
    const controllerRoutes: any[] = metadata[routesSymbol] ?? {};
    const prefix = metadata[controllerPrefix] ?? '';
    for (const route of Object.values(controllerRoutes)) {
        const _baseRoute = {
            ...route,
            path: join('/', modulePrefix ?? '', prefix ?? '', route.path),
            controller: controllerName,
        };
        routes.push(_baseRoute);
    }
    return routes;
}
