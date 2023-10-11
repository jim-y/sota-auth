import { join } from 'path';

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

export const prefixSymbol = Symbol.for('prefixSymbol');
export const routesSymbol = Symbol.for('routesSymbol');
export const versionSymbol = Symbol.for('versionSymbol');
export const aliasSymbol = Symbol.for('aliasSymbol');
export const depsSymbol = Symbol.for('depsSymbol');
export const moduleRoutesSymbol = Symbol.for('moduleRoutesSymbol');
export const moduleMetaSymbol = Symbol.for('moduleMetaSymbol');
export const injectorConfigSymbol = Symbol.for('injectorConfigSymbol');
export const singletonSymbol = Symbol.for('singleton');

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
                ...route
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
            [property]: value
        };
    }

    return originalMethod;
}

export function _addToRoute(property, value: any) {
    return function (originalMethod: any, context) {
        return _add(originalMethod, context, property, value);
    };
}

export function _processModuleControllers(
    controllers: any[],
    moduleRoutes: any[],
    injector: any,
    modulePrefix: string = ''
) {
    for (const ctrl of controllers) {
        const controllerName = ctrl.name;

        // @ts-ignore
        const metadata = ctrl[Symbol.metadata];

        if (!metadata) {
            throw new Error(`There are no metadata for controller: ${controllerName}`);
        }

        const controllerPrefix = metadata[prefixSymbol];
        const controllerRoutes: any[] = metadata[routesSymbol];
        const controllerAlias: string[] = metadata[aliasSymbol];

        if (!controllerRoutes) {
            throw new Error(`There are no routes in controller: ${controllerName}`);
        }

        let injectionName: string = controllerName;

        const instance = new ctrl();
        
        const deps = metadata[depsSymbol];
        for (const dependencyName in deps) {
            const field = deps[dependencyName];
            Object.defineProperty(instance, field, {
                enumerable: false,
                configurable: false,
                get() {
                    return injector[dependencyName];
                }
            });
        }

        injector[injectionName] = instance;

        if (controllerAlias) {
            for (const alias of controllerAlias) {
                injector[alias] = { type: 'alias', target: injectionName };
            }
        }

        for (const route of Object.values(controllerRoutes)) {
            const _baseRoute = {
                ...route,
                path: join('/', modulePrefix, controllerPrefix, route.path),
                controller: injectionName
            };
            moduleRoutes.push(_baseRoute);
        }
    }
}

export function _processModuleServices(services: any[], injector) {
    for (const service of services) {
        // @ts-ignore
        const metadata = service[Symbol.metadata];
        const serviceAlias: string[] = metadata?.[aliasSymbol];
        injector[service.name] = new service();
        if (serviceAlias) {
            for (const alias of serviceAlias) {
                injector[alias] = { type: 'alias', target: service.name };
            }
        }
    }
}

export function _processSubModules(
    modules: any[],
    moduleRoutes: any[],
    injectorConfig: any,
    parentModulePrefix: string = ''
) {
    for (const module of modules) {
        // @ts-ignore
        const moduleMeta: ModuleMeta = module[Symbol.metadata]?.[moduleMetaSymbol];
        // @ts-ignore
        const subModuleInjectorConfig = module[Symbol.metadata]?.[injectorConfigSymbol];
        // @ts-ignore
        const subModuleRoutes: Route[] = module[Symbol.metadata]?.[moduleRoutesSymbol];

        // Copying paths from submodule to parent module
        // Optionally prefixing path with parentModulePrefix if needed
        if (subModuleRoutes) {
            for (const route of subModuleRoutes) {
                const path = moduleMeta.inheritPrefix ? join('/', parentModulePrefix, route.path) : route.path;
                moduleRoutes.push({
                    ...route,
                    path
                });
            }
        }

        if (subModuleInjectorConfig) {
            for (const depName in subModuleInjectorConfig) {
                if (injectorConfig[depName] != null) {
                    throw new Error(`Duplicated dependency (${depName}) in injectorconfig for module (${module.name})`);
                } else {
                    injectorConfig[depName] = subModuleInjectorConfig[depName];
                }
            }
        }
    }
}
