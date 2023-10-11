"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports._processSubModules = exports._processModuleServices = exports._processModuleControllers = exports._addToRoute = exports._add = exports._httpMethodDecoratorFactory = exports.singletonSymbol = exports.injectorConfigSymbol = exports.moduleMetaSymbol = exports.moduleRoutesSymbol = exports.depsSymbol = exports.aliasSymbol = exports.versionSymbol = exports.routesSymbol = exports.prefixSymbol = void 0;
const path_1 = require("path");
// @ts-ignore
Symbol.metadata ??= Symbol('Symbol.metadata');
exports.prefixSymbol = Symbol.for('prefixSymbol');
exports.routesSymbol = Symbol.for('routesSymbol');
exports.versionSymbol = Symbol.for('versionSymbol');
exports.aliasSymbol = Symbol.for('aliasSymbol');
exports.depsSymbol = Symbol.for('depsSymbol');
exports.moduleRoutesSymbol = Symbol.for('moduleRoutesSymbol');
exports.moduleMetaSymbol = Symbol.for('moduleMetaSymbol');
exports.injectorConfigSymbol = Symbol.for('injectorConfigSymbol');
exports.singletonSymbol = Symbol.for('singleton');
function _httpMethodDecoratorFactory(path, method) {
    return function (originalMethod, context) {
        const methodName = context.name;
        const route = { method, path, action: methodName };
        if (!context.metadata[exports.routesSymbol]) {
            context.metadata[exports.routesSymbol] = {};
        }
        const routeMeta = context.metadata[exports.routesSymbol][methodName];
        if (!routeMeta) {
            context.metadata[exports.routesSymbol][methodName] = route;
        }
        else {
            context.metadata[exports.routesSymbol][methodName] = {
                ...routeMeta,
                ...route
            };
        }
        return originalMethod;
    };
}
exports._httpMethodDecoratorFactory = _httpMethodDecoratorFactory;
function _add(originalMethod, context, property, value) {
    const methodName = context.name;
    if (!context.metadata[exports.routesSymbol]) {
        context.metadata[exports.routesSymbol] = {};
    }
    const routeMeta = context.metadata[exports.routesSymbol][methodName];
    if (!routeMeta) {
        context.metadata[exports.routesSymbol][methodName] = { [property]: value };
    }
    else {
        context.metadata[exports.routesSymbol][methodName] = {
            ...routeMeta,
            [property]: value
        };
    }
    return originalMethod;
}
exports._add = _add;
function _addToRoute(property, value) {
    return function (originalMethod, context) {
        return _add(originalMethod, context, property, value);
    };
}
exports._addToRoute = _addToRoute;
function _processModuleControllers(controllers, moduleRoutes, injector, modulePrefix = '') {
    for (const ctrl of controllers) {
        const controllerName = ctrl.name;
        // @ts-ignore
        const metadata = ctrl[Symbol.metadata];
        if (!metadata) {
            throw new Error(`There are no metadata for controller: ${controllerName}`);
        }
        const controllerPrefix = metadata[exports.prefixSymbol];
        const controllerRoutes = metadata[exports.routesSymbol];
        const controllerAlias = metadata[exports.aliasSymbol];
        if (!controllerRoutes) {
            throw new Error(`There are no routes in controller: ${controllerName}`);
        }
        let injectionName = controllerName;
        const instance = new ctrl();
        const deps = metadata[exports.depsSymbol];
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
                path: (0, path_1.join)('/', modulePrefix, controllerPrefix, route.path),
                controller: injectionName
            };
            moduleRoutes.push(_baseRoute);
        }
    }
}
exports._processModuleControllers = _processModuleControllers;
function _processModuleServices(services, injector) {
    for (const service of services) {
        // @ts-ignore
        const metadata = service[Symbol.metadata];
        const serviceAlias = metadata?.[exports.aliasSymbol];
        injector[service.name] = new service();
        if (serviceAlias) {
            for (const alias of serviceAlias) {
                injector[alias] = { type: 'alias', target: service.name };
            }
        }
    }
}
exports._processModuleServices = _processModuleServices;
function _processSubModules(modules, moduleRoutes, injectorConfig, parentModulePrefix = '') {
    for (const module of modules) {
        // @ts-ignore
        const moduleMeta = module[Symbol.metadata]?.[exports.moduleMetaSymbol];
        // @ts-ignore
        const subModuleInjectorConfig = module[Symbol.metadata]?.[exports.injectorConfigSymbol];
        // @ts-ignore
        const subModuleRoutes = module[Symbol.metadata]?.[exports.moduleRoutesSymbol];
        // Copying paths from submodule to parent module
        // Optionally prefixing path with parentModulePrefix if needed
        if (subModuleRoutes) {
            for (const route of subModuleRoutes) {
                const path = moduleMeta.inheritPrefix ? (0, path_1.join)('/', parentModulePrefix, route.path) : route.path;
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
                }
                else {
                    injectorConfig[depName] = subModuleInjectorConfig[depName];
                }
            }
        }
    }
}
exports._processSubModules = _processSubModules;
//# sourceMappingURL=decorator-helpers.js.map