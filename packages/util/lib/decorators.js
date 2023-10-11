"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Inject = exports.Module = exports.Put = exports.Delete = exports.Post = exports.Get = exports.Alias = exports.Injectable = exports.Controller = void 0;
const decorator_helpers_1 = require("./decorator-helpers");
// @ts-ignore
Symbol.metadata ??= Symbol('Symbol.metadata');
/**
 * ClassDecorator
 * @example
 *  @Controller('cat')
 *  class CatController {}
 */
function Controller(prefix = '') {
    return function (constructor, context) {
        context.metadata[decorator_helpers_1.prefixSymbol] = prefix;
    };
}
exports.Controller = Controller;
function Injectable(prefix = '') {
    return function (constructor, context) {
        context.metadata[decorator_helpers_1.depsSymbol] = {};
    };
}
exports.Injectable = Injectable;
/**
 * ClassDecorator
 * - alias injection name
 * @example
 *  @Alias('AccountServiceV2')
 *  class AccountService {}
 */
function Alias(alias) {
    return function (constructor, context) {
        context.metadata[decorator_helpers_1.aliasSymbol] = Array.isArray(alias) ? alias : [alias];
    };
}
exports.Alias = Alias;
function Get(path = '') {
    return (0, decorator_helpers_1._httpMethodDecoratorFactory)(path, 'get');
}
exports.Get = Get;
function Post(path = '') {
    return (0, decorator_helpers_1._httpMethodDecoratorFactory)(path, 'post');
}
exports.Post = Post;
function Delete(path = '') {
    return (0, decorator_helpers_1._httpMethodDecoratorFactory)(path, 'delete');
}
exports.Delete = Delete;
function Put(path = '') {
    return (0, decorator_helpers_1._httpMethodDecoratorFactory)(path, 'put');
}
exports.Put = Put;
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
function Module(moduleOptions) {
    return function (constructor, context) {
        const { prefix, inheritPrefix, controllers, services, modules } = moduleOptions;
        const moduleRoutes = [];
        const injector = {};
        if (controllers) {
            (0, decorator_helpers_1._processModuleControllers)(controllers, moduleRoutes, injector, prefix);
        }
        if (services) {
            (0, decorator_helpers_1._processModuleServices)(services, injector);
        }
        if (modules) {
            (0, decorator_helpers_1._processSubModules)(modules, moduleRoutes, injector, prefix);
        }
        context.metadata[decorator_helpers_1.moduleRoutesSymbol] = moduleRoutes;
        context.metadata[decorator_helpers_1.injectorConfigSymbol] = injector;
        context.metadata[decorator_helpers_1.moduleMetaSymbol] = {
            prefix,
            inheritPrefix
        };
        Object.defineProperties(constructor, {
            singletons: {
                enumerable: false,
                configurable: false,
                get() {
                    return context.metadata[decorator_helpers_1.injectorConfigSymbol];
                }
            },
            controllers: {
                enumerable: false,
                configurable: false,
                get() {
                    return context.metadata[decorator_helpers_1.injectorConfigSymbol];
                }
            },
            routes: {
                enumerable: false,
                configurable: false,
                get() {
                    return context.metadata[decorator_helpers_1.moduleRoutesSymbol];
                }
            }
        });
    };
}
exports.Module = Module;
/**
 * ClassFieldDecorator
 * - decorator to inject a dependency from the IOC container
 * @example
 *  class ProjectController {
 *      @Inject('HTTP') http: BackendHttp;
 *  }
 */
function Inject(name) {
    return function (value, context) {
        if (context.kind !== 'field') {
            throw new Error('The Inject() decorator must be used as a class field decorator');
        }
        if (!context.metadata[decorator_helpers_1.depsSymbol]) {
            context.metadata[decorator_helpers_1.depsSymbol] = {};
        }
        context.metadata[decorator_helpers_1.depsSymbol][name] = context.name;
        return value;
    };
}
exports.Inject = Inject;
//# sourceMappingURL=decorators.js.map