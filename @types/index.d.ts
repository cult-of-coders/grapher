  export type LinkDenormalizeSchema = {
    field: string;
    body: unknown;
    bypassSchema?: boolean;
  };

  export type LinkConfigType = 'one' | 'many' | '1' | '*';

  export type LinkConfigCollection<T> = Mongo.Collection<T>;

  // Check: lib/links/config.schema.js:LinkConfigSchema
  export type LinkConfig<T = unknown> = {
    // not needed for inversed links
    type?: LinkConfigType;

    // Looks like intention is to support other collections, not just mongodb
    collection: LinkConfigCollection<T> | string; // TODO: define collection type
    foreignIdentityField?: string;
    field?: string;
    metadata?: boolean;
    inversedBy?: string;
    index?: boolean;
    unique?: boolean;
    autoremove?: boolean;
    denormalize?: unknown;

    // processed link config
    relatedLinker?: Grapher.LinkerClass;
  };

  export type ProcessedDirectLink = Omit<
    LinkConfig,
    'type' | 'field' | 'collection'
  > & {
    type: LinkConfigType;
    field: string;
    collection: LinkConfigCollection;
  };

  export type ProcessedReverseLink = Omit<
    LinkConfig,
    'metadata' | 'inversedBy' | 'collection'
  > & {
    collection: LinkConfigCollection;
    inversedBy: string;
    metadata?: boolean;
    relatedLinker: LinkerClass;
  };

  export type ProcessedLink = ProcessedDirectLink | ProcessedReverseLink;

  export type LinkConfigDefaults = Partial<LinkConfig>;

  export class LinkerClass {
    constructor(
      mainCollection: Mongo.Collection<unknown>,
      linkName: string,
      linkConfig: LinkConfig,
    );

    linkStorageField: string | undefined;
    linkConfig: ProcessedLink;
    mainCollection: Mongo.Collection<T, U>;

    createLink(
      object: unknown,
      collection?: Mongo.Collection<unknown> | null,
    ): LinkBaseClass;

    isVirtual(): boolean;
    isSingle(): boolean;
  }

  export type DefaultFiltersWithMeta<T> = Mongo.Selector<T> & {
    $meta?: unknown;
  };

  export type LinkObject = {
    _id: string;
    [Key: string]: unknown;
  };

  export type BodyFields = {
    [Key: string]: number | BodyFields;
  };

  // Idea is that we have $filters on T, i.e. the actual document.
  // But body should be defined based on links.
  // TODO: nesting?
  export type Body<T, WithLinks = string> = {
    $options?: Options;
    $filters?: Mongo.Query<T>;
    [Key: WithLinks]: number | Body<T, WithLinks[Key]>;
  };

  export class LinkBaseClass {
    constructor<T, U = T>(
      linker: LinkerClass,
      object: LinkObject,
      collection: Mongo.Collection<T, U>,
    );

    get config(): LinkConfig; // processed
    get isVirtual(): boolean;
    object: LinkObject;

    // Stored link information value
    value(): unknown;

    find<Res = T>(
      filters?: DefaultFiltersWithMeta<T>,
      options?: Mongo.Options<T>,
      userId?: string,
    ): Mongo.Cursor<T, Res>; // TODO: depends on passed-in fields

    fetch<Res = T>(
      filters?: DefaultFiltersWithMeta<T>,
      options?: Mongo.Options<T>,
      userId?: string,
    ): Promise<Res | Res[] | undefined>;

    fetchAsArray<Res = T>(
      filters?: DefaultFiltersWithMeta<T>,
      options?: Mongo.Options<T>,
      userId?: string,
    ): Promise<Res[]>;

    add(what: unknown): Promise<this>;
    remove(what: unknown): Promise<this>;
    set(what: unknown, metadata?): Promise<this>;
    unset(): Promise<this>;
    metadata(): Promise<this>;

    clean(): void;
  }

  type BaseDocumentShape = {
    _id?: string;
  };

  type IdSingleOption = string | BaseDocumentShape;

  type IdOption = IdSingleOption | IdSingleOption[];

  type SmartArgumentsOptions =
    | {
        saveToDatabase: true;
        collection: Mongo.Collection<unknown>;
      }
    | {
        saveToDatabase?: false;
      };

  export type ExposureFirewallFn = (
    filters: { [key: string]: unknown },
    options: Mongo.Options<T>,
    userId?: string,
  ) => void | Promise<void>;

  export type Params = {
    [key: string]: unknown;
  };

  export type Filters<T = object> = Mongo.Query<T>;
  export type Options<T = object> = Mongo.Options<T>;

  export type ValidateParamsFn = (params: P) => void | Promise<void>;
  export type ValidateParamsParam = boolean | ValidateParamsFn;

  export type QueryOptions<T = object, P = Params> = Mongo.Options<T> & {
    params?: P;
    validateParams?: ValidateParamsParam;
  };

  export type QueryFetchContext<T> = {
    userId?: string;
    $options?: Mongo.Options<T>;
  };

  export type ExposureConfig = {
    firewall?: ExposureFirewallFn | ExposureFirewallFn[];
    maxLimit?: number;
    maxDepth?: number;
    publication?: boolean;
    method?: boolean;
    blocking?: boolean;
    body?: Body | boolean | ((userId: string | undefined) => Body);
    restrictedFields?: string[];
    restrictLinks?: ((userId: string | undefined) => string[]) | string[];
  };

  export class ExposureClass<T, U = T> {
    constructor(
      collection: Mongo.Collection<T, U>,
      config?: ExposureConfig | ExposureFirewallFn,
    );

    collection: Mongo.Collection<T, U>;
    name: string;
    config: ExposureConfig;

    // Sets global config
    static setConfig(config: ExposureConfig): void;
    // Gets global config
    static getConfig(): ExposureConfig;
  }

  export type DataCallback = <T = unknown>(err: unknown, data: T) => void;

  export interface QueryBase {
    // client-side
    fetch(callback: DataCallback): unknown[];
    fetchAsync(): Promise<unknown>;
    // @deprecated
    fetchSync(): Promise<unknown>;

    fetchOneAsync(): Promise<unknown>;
    // @deprecated
    fetchOneSync(): Promise<unknown>;

    getCountAsync(): Promise<unknown>;
    // @deprecated
    getCountSync(): Promise<unknown>;
  }

  export class QueryBaseClass<T, P> implements QueryBase {
    isGlobalQuery: boolean;

    constructor(
      collection: Mongo.Collection<T>,
      body: Body,
      options?: Options<T, P>,
    );
  }

  export class NamedQueryBaseClass<T, P> {
    isNamedQuery: boolean;

    constructor(
      name: string,
      collection: Mongo.Collection<T>,
      name: string,
      body: Body,
      options?: Options<T, P>,
    );

    // client-side
    fetch(callback: (err: unknown, res: unknown[]) => void): void;
    fetchAsync(): Promise<unknown>;
    fetchOneAsync(): Promise<unknown>;
    getCountAsync(): Promise<unknown>;
  }

  export type HypernovaConfig<P = Params> = {
    params?: P;
    bypassFirewalls?: boolean;
  };

  export type CountEndpointFunction<T, U> = (
    request: unknown,
  ) => Mongo.Cursor<T, Mongo.DispatchTransform<O['transform'], T, U>>;

  type MeteorSubscribeCallbacks = {
    onStop(err?: unknown): void;
    onReady(): void;
  };

  function createQuery(
    name: string,
    body: Body,
    options?: QueryOptions,
  ): NamedQueryBaseClass;

  function createQuery(body: Body, options?: QueryOptions): QueryBase;


namespace Grapher {
  export * from 'meteor/cultofcoders:grapher';
}

namespace Mongo {
  interface Collection<T, U = T> {
    __links: Record<string, Grapher.LinkerClass>;
    __isExposedForGrapher?: boolean;
    __exposure?: ExposureClass<T, U>;
    firewall?: (
      filters: Grapher.Filters<T>,
      options: Grapher.Options<T>,
      userId?: string,
    ) => Promise<void>;

    addLinks(links: Record<string, Grapher.LinkConfig>): void;
    getLinker(name: string): Grapher.LinkerClass | undefined;
    getLink(
      doc: unknown,
      name: string,
    ): Promise<Grapher.LinkBaseClass | undefined>;

    expose(config?: Grapher.ExposureConfig | Grapher.ExposureFirewallFn): void;

    find<O extends Options<T>>(
      selector?: Selector<T> | ObjectID | string,
      options?: O,
      userId?: string,
      enforceMaxDepth?: boolean,
    ): Cursor<T, DispatchTransform<O['transform'], T, U>>;
  }
}
