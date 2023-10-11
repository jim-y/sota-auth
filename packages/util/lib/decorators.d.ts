import type { ModuleOptions } from './decorator-helpers';
/**
 * ClassDecorator
 * @example
 *  @Controller('cat')
 *  class CatController {}
 */
export declare function Controller(prefix?: string): (constructor: Function, context: any) => void;
export declare function Injectable(prefix?: string): (constructor: Function, context: any) => void;
/**
 * ClassDecorator
 * - alias injection name
 * @example
 *  @Alias('AccountServiceV2')
 *  class AccountService {}
 */
export declare function Alias(alias: string | string[]): (constructor: Function, context: any) => void;
export declare function Get(path?: string): (originalMethod: any, context: any) => any;
export declare function Post(path?: string): (originalMethod: any, context: any) => any;
export declare function Delete(path?: string): (originalMethod: any, context: any) => any;
export declare function Put(path?: string): (originalMethod: any, context: any) => any;
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
export declare function Module(moduleOptions: ModuleOptions): (constructor: Function, context: any) => void;
/**
 * ClassFieldDecorator
 * - decorator to inject a dependency from the IOC container
 * @example
 *  class ProjectController {
 *      @Inject('HTTP') http: BackendHttp;
 *  }
 */
export declare function Inject(name: string): (value: any, context: any) => any;
