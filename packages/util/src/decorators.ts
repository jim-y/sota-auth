import {
    _add,
    _addToRoute,
    _httpMethodDecoratorFactory,
    _processModuleControllers,
    _processModuleServices,
    _processSubModules,
    prefixSymbol,
    aliasSymbol,
    depsSymbol,
    moduleRoutesSymbol,
    injectorConfigSymbol,
    moduleMetaSymbol,
    singletonSymbol
} from './decorator-helpers';
import type { ModuleMeta, ModuleOptions } from './decorator-helpers';

// @ts-ignore
Symbol.metadata ??= Symbol('Symbol.metadata');

/**
 * ClassDecorator
 * @example
 *  @Controller('cat')
 *  class CatController {}
 */
export function Controller(prefix: string = '') {
    return function (constructor: Function, context: any) {
        context.metadata[prefixSymbol] = prefix;
    };
}

/**
 * ClassDecorator
 * - alias injection name
 * @example
 *  @Alias('AccountServiceV2')
 *  class AccountService {}
 */
export function Alias(alias: string | string[]) {
    return function (constructor: Function, context) {
        context.metadata[aliasSymbol] = Array.isArray(alias) ? alias : [alias];
    };
}

export function Get(path: string = '') {
    return _httpMethodDecoratorFactory(path, 'get');
}
export function Post(path: string = '') {
    return _httpMethodDecoratorFactory(path, 'post');
}
export function Delete(path: string = '') {
    return _httpMethodDecoratorFactory(path, 'delete');
}
export function Put(path: string = '') {
    return _httpMethodDecoratorFactory(path, 'put');
}

/**
 * ClassDecorator
 * - defines a module. A module constructs route definitions and defines singletons for the shared injector
 * - a module can have sub-modules
 * - you can request the singletons from a static property as ModuleName['singletons']
 * - you can request the route definitions from a static property as ModuleName['routes']
 * @example
 *  @Module({
 *      prefix: 'ext',
 *      modules: [ProjectAPIV1Module, ProjectAPIV2Module]
 *      controllers: [SharedController]
 *      services: [SharedService, SharedRemote]
 *  })
 *  class AppModule {}
 */
export function Module(moduleOptions: ModuleOptions) {
    return function (constructor: Function, context) {
        const { prefix, inheritPrefix, controllers, services, modules } = moduleOptions;

        const moduleRoutes = [];
        const injector = {};

        if (controllers) {
            _processModuleControllers(controllers, moduleRoutes, injector, prefix);
        }

        if (services) {
            _processModuleServices(services, injector);
        }

        if (modules) {
            _processSubModules(modules, moduleRoutes, injector, prefix);
        }

        context.metadata[moduleRoutesSymbol] = moduleRoutes;
        context.metadata[injectorConfigSymbol] = injector;
        context.metadata[moduleMetaSymbol] = {
            prefix,
            inheritPrefix
        } as ModuleMeta;

        Object.defineProperties(constructor, {
            singletons: {
                enumerable: false,
                configurable: false,
                get() {
                    return context.metadata[injectorConfigSymbol];
                }
            },
            controllers: {
                enumerable: false,
                configurable: false,
                get() {
                    return context.metadata[injectorConfigSymbol];
                }
            },
            routes: {
                enumerable: false,
                configurable: false,
                get() {
                    return context.metadata[moduleRoutesSymbol];
                }
            }
        });
    };
}

/**
 * ClassFieldDecorator
 * - decorator to inject a dependency from the IOC container
 * @example
 *  class ProjectController {
 *      @Inject('HTTP') http: BackendHttp;
 *  }
 */
export function Inject(name: string) {
    return function (value, context) {
        if (context.kind !== 'field') {
            throw new Error('The Inject() decorator must be used as a class field decorator');
        }

        if (!context.metadata[depsSymbol]) {
            context.metadata[depsSymbol] = {};
        }

        context.metadata[depsSymbol][name] = context.name;
        return value;
    };
}