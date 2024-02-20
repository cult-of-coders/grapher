declare module 'meteor/cultofcoders:grapher' {
  export type LinkDenormalizeSchema = {
    field: string;
    body: unknown;
    bypassSchema?: boolean;
  };

  export type LinkConfigType = 'one' | 'many' | '1' | '*';

  // Check: lib/links/config.schema.js:LinkConfigSchema
  export type LinkConfig = {
    // not needed for inversed links
    type?: LinkConfigType;

    // Looks like intention is to support other collections, not just mongodb
    collection:
      | {
          _name: string;
        }
      | string; // TODO: define collection type
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

  export type LinkConfigDefaults = Partial<LinkConfig>;

  export class LinkerClass {
    constructor(
      mainCollection: Mongo.Collection<unknown>,
      linkName: string,
      linkConfig: LinkConfig,
    );

    linkStorageField: string | undefined;
    linkConfig: LinkConfig;
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

  export type LinkObject = Record<string, unknown>;

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
}

namespace Grapher {
  export * from 'meteor/cultofcoders:grapher';
}

namespace Mongo {
  interface Collection<T, U = T> {
    __links: Record<string, Grapher.LinkerClass>;

    addLinks(links: Record<string, Grapher.LinkConfig>): void;
    getLinker(name: string): Grapher.LinkerClass | undefined;
    getLink(
      doc: unknown,
      name: string,
    ): Promise<Grapher.LinkBaseClass | undefined>;
  }
}
