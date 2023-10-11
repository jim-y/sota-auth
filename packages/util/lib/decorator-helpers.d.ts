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
export declare const prefixSymbol: unique symbol;
export declare const routesSymbol: unique symbol;
export declare const versionSymbol: unique symbol;
export declare const aliasSymbol: unique symbol;
export declare const depsSymbol: unique symbol;
export declare const moduleRoutesSymbol: unique symbol;
export declare const moduleMetaSymbol: unique symbol;
export declare const injectorConfigSymbol: unique symbol;
export declare const singletonSymbol: unique symbol;
export declare function _httpMethodDecoratorFactory(path: any, method: any): (originalMethod: any, context: any) => any;
export declare function _add(originalMethod: any, context: any, property: any, value: any): any;
export declare function _addToRoute(property: any, value: any): (originalMethod: any, context: any) => any;
export declare function _processModuleControllers(controllers: any[], moduleRoutes: any[], injector: any, modulePrefix?: string): void;
export declare function _processModuleServices(services: any[], injector: any): void;
export declare function _processSubModules(modules: any[], moduleRoutes: any[], injectorConfig: any, parentModulePrefix?: string): void;
