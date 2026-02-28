// Definitions by: Robbie Van Gorkom <https://github.com/vangorra>
//                 Matthew Zartman <https://github.com/mattmm3d>
//                 Jan Dvorak <https://github.com/storytellercz>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped
// Minimum TypeScript Version: 4.1

declare module 'meteor/reywood:publish-composite' {
  import { Mongo } from 'meteor/mongo';

  type RepeatingOptions = {
    find: (topLevelDocument: object) => Mongo.Cursor;
    children?:
      | RepeatingOptions[]
      | ((topLevelDocument: object) => RepeatingOptions[]);
    collectionName?: string;
  };

  function publishComposite(
    name: string,
    options:
      | RepeatingOptions
      | ((
          this: Meteor.MethodThisType,
          body: Mongo.FieldSpecifier,
        ) => RepeatingOptions),
  ): void;
}
