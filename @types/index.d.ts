export type LinkDenormalizeSchema = {
  field: string;
  body: unknown;
  bypassSchema?: boolean;
};

export type LinkConfigType = 'one' | 'many' | '1' | '*';

// Check: lib/links/config.schema.js:LinkConfigSchema
export type LinkConfig = {
  type: LinkConfigType;

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
};

export type LinkConfigDefaults = Partial<LinkConfig>;

export class LinkerClass {
  constructor(
    mainCollection: Mongo.Collection<unknown>,
    linkName: string,
    linkConfig: LinkConfig,
  );
}

export as namespace Grapher;
