///<reference path="@types/index.d.ts" />

import { GrapherQuery } from "@grapher";
import { Mongo } from "meteor/mongo";
import { DocumentNode } from "graphql";

declare module "meteor/cultofcoders:grapher" {
  export * from "@grapher";
}

declare module "meteor/mongo" {
  export interface Collection {
    astToQuery(ast: DocumentNode, query: GrapherQuery): Mongo.Cursor<any>;
  }
}
