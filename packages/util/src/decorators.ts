import { join } from 'path';
import { _httpMethodDecoratorFactory, getRoutesForController } from './decorator-helpers';
import { controllerPrefix, aliasSymbol, depsSymbol, moduleMetaSymbol, middlewaresSymbol } from './decorator-symbols';
import type { ModuleMeta, ModuleOptions } from './decorator-helpers';

type Entry = {
    type: 'class' | 'constant' | 'singleton' | 'model';
    tags?: string[];
    value: any;
    instantiated?: boolean;
};
export class Container {
    private static _instance: Container;

    config: Record<string, Entry> = {};

    public register(injectionToken, entry: Entry) {
        if (!this.config[injectionToken]) {
            this.config[injectionToken] = {
                ...entry,
                tags: entry.tags ?? [],
            };
        }
    }

    public get(token) {
        const injectionToken = token.name ?? token;
        const entry = this.config[injectionToken];
        if (entry.type === 'class') {
            let instance = new entry.value();
            const dependencies = entry.value[Symbol.metadata][depsSymbol];
            if (dependencies && Object.keys(dependencies).length > 0) {
                for (const token in dependencies) {
                    const field = dependencies[token];
                    instance[field] = this.get(token);
                }
            }
            return instance;
        } else if (entry.type === 'constant' || entry.type === 'model') {
            return entry.value;
        } else if (entry.type === 'singleton') {
            if (entry.instantiated) return entry.value.instance;
            let instance = entry.value.instance;
            const dependencies = entry.value[Symbol.metadata][depsSymbol];
            if (dependencies && Object.keys(dependencies).length > 0) {
                for (const token in dependencies) {
                    const field = dependencies[token];
                    instance[field] = this.get(token);
                }
            }
            entry.instantiated = true;
            return instance;
        }
    }

    public getAllByTagNames(tag: string | string[]) {
        const tagsToFind = typeof tag === 'string' ? [tag] : tag;
        const entries = [];
        for (const token in this.config) {
            const entry = this.config[token];
            if (tagsToFind.every((tagToFind) => entry.tags.indexOf(tagToFind) > -1)) {
                entries.push(this.get(token));
            }
        }
        return entries;
    }

    public attachTags(token, tags: string[]) {
        const entry = this.config[token.name ?? token];
        if (!tags || !entry) throw new Error('missing tags or missing entry');
        entry.tags = Array.from(new Set([...entry.tags, ...tags]));
    }

    static get instance() {
        if (!this._instance) {
            this._instance = new Container();
        }
        return this._instance;
    }
}

export const container = Container.instance;

// @ts-ignore
Symbol.metadata ??= Symbol('Symbol.metadata');

/**
 * ClassDecorator
 * @example
 *  @Controller('cat')
 *  class CatController {}
 */
export function Controller(prefix: string = '', tag: string | string[] = []) {
    const tags = typeof tag === 'string' ? [tag] : tag;
    return function (constructor: Function, context: any) {
        context.metadata[controllerPrefix] = prefix;
        container.register(context.name, {
            type: 'class',
            tags: tags.concat(['controller']),
            value: constructor,
        });
    };
}

export function Injectable(tag: string | string[] = []) {
    const tags = typeof tag === 'string' ? [tag] : tag;
    return function (constructor: Function, context: any) {
        container.register(context.name, {
            type: 'class',
            tags,
            value: constructor,
        });
    };
}

export function Model(constructor: Function, context: any) {
    container.register(context.name, {
        type: 'model',
        tags: ['model'],
        value: constructor,
    });
}

export function Singleton(tag: string | string[] = []) {
    const tags = typeof tag === 'string' ? [tag] : tag;
    return function (constructor: Function, context: any) {
        var values = Object.getOwnPropertyNames(constructor);

        if (values.findIndex((prop) => prop === 'instance') < 0) {
            throw new Error('A @Singleton() decorated class is supposed to have a static instance() method');
        }

        container.register(context.name, {
            type: 'singleton',
            tags,
            value: constructor,
        });
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

export class AbstractModule {
    public static routes: any[] = [];
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

        if (controllers) {
            for (const ctrl of controllers) {
                container.attachTags(ctrl.name, [context.name]);
            }
        }

        context.metadata[moduleMetaSymbol] = {
            prefix,
            inheritPrefix,
        } as ModuleMeta;

        Object.defineProperties(constructor, {
            __modules: {
                enumerable: true,
                configurable: false,
                get() {
                    return modules;
                },
            },
            modules: {
                enumerable: true,
                configurable: false,
                get() {
                    let allModules = [];
                    if (modules) {
                        for (const module of this.__modules) {
                            const subModules = module.modules;
                            allModules.push(...subModules);
                            allModules.push(module);
                        }
                    }
                    return allModules;
                },
            },
            __controllers: {
                enumerable: true,
                configurable: false,
                get() {
                    return container.getAllByTagNames(['controller', context.name]);
                },
            },
            controllers: {
                enumerable: true,
                configurable: false,
                get() {
                    return container.getAllByTagNames(['controller']);
                },
            },
            __routes: {
                enumerable: true,
                configurable: false,
                get() {
                    const ownRoutes = [];
                    if (this.__controllers) {
                        for (const moduleController of this.__controllers) {
                            const { prefix } = this[Symbol.metadata][moduleMetaSymbol];
                            const controllerRoutes = getRoutesForController(moduleController, prefix);
                            ownRoutes.push(...controllerRoutes);
                        }
                    }
                    return ownRoutes;
                },
            },
            routes: {
                enumerable: true,
                configurable: false,
                get() {
                    const routes = [];
                    if (this.__modules) {
                        for (const module of this.__modules) {
                            const { inheritPrefix, prefix: subModulePrefix } =
                                module[Symbol.metadata][moduleMetaSymbol];
                            const { prefix: parentModulePrefix } = this[Symbol.metadata][moduleMetaSymbol];
                            if (inheritPrefix) {
                                module[Symbol.metadata][moduleMetaSymbol].prefix = join(
                                    parentModulePrefix ?? '',
                                    subModulePrefix ?? ''
                                );
                            }
                            routes.push(...module.routes);
                        }
                    }
                    if (this.__routes) {
                        routes.push(...this.__routes);
                    }
                    return routes;
                },
            },
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
export function Inject(token: any) {
    return function (value, context) {
        if (context.kind !== 'field') {
            throw new Error('The Inject() decorator must be used as a class field decorator');
        }

        const injectionToken = token.name ?? token;

        if (!context.metadata[depsSymbol]) {
            context.metadata[depsSymbol] = {};
        }

        context.metadata[depsSymbol][injectionToken] = context.name;
        return value;
    };
}

export function Middlewares(middlewareFunctions: Function[]) {
    return function (originalMethod: any, context) {
        if (!context.metadata[middlewaresSymbol]) {
            context.metadata[middlewaresSymbol] = {};
        }
        context.metadata[middlewaresSymbol][context.name] = middlewareFunctions;
        return originalMethod;
    };
}
