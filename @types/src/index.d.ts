/** @format */

///<reference types="graphql" />

declare module 'meteor/cultofcoders:grapher' {
  import { Mongo } from 'meteor/mongo'
  import { DocumentNode } from 'graphql'

  module Grapher {
    type TypesEnum = 'one' | 'many'

    interface Query {
      setParams(): any
      resolve(): any
      expose(): any
    } // WIP

    interface ILink<TSchema> {
      collection: Mongo.Collection<TSchema>
      type: TypesEnum
      metadata?: true
      field: string
      index?: boolean
      denormalize?: iDenormalize
    }

    interface ILink<TSchema> {
      collection: Mongo.Collection<TSchema>
      inversedBy: string
      denormalize?: iDenormalize
    }

    type Link<TSchema = {}> = {
      [field: string]: ILink<TSchema>
    }

    type QueryOptions<T = any> = {
      $filter?: Mongo.FieldExpression<T>
    }
    type Body<T> = {
      [field: string]: DependencyGraph | Body<T> | QueryOptions<T>
    }
    type createQuery<T = {}> = (
      name: string,
      body: Body<T> | {},
      options?: {}
    ) => any

    type QueryBody<T = {}> = Body<T>

    type BodyEnum = 0 | 1

    type GrapherBody<TSchema = {}> = TSchema extends object
      ? SelectionSet<GraphQLQuery<TSchema>>
      : SelectionSet<BodyEnum>

    type TEmbodyArgs<TArgs, TSchema = {}> = {
      body: GrapherBody<TSchema>
      getArgs(): TArgs
    }

    type DependencyGraph = {
      [field: string]: GrapherBody | DependencyGraph
    }

    type TFirewall<TFilters, TOptions> = (
      filters: TFilters,
      options: TOptions,
      userId: string
    ) => void

    interface SelectionSet<BodyType> {
      [field: string]: BodyType
    }
    interface iDenormalize {
      field: string
      body: {
        [field: string]: number
      }
    }

    interface GraphQLQuery<TSchema extends object = {}, TQueryArguments = {}> {
      embody?: (transform: TEmbodyArgs<TQueryArguments>) => void
      $filter?: Mongo.Selector<TSchema>
      $options?: Mongo.Options
      // Integer
      maxDepth?: number
      // Integer
      maxLimit?: number
      deny?: string[]
      intersect?: GrapherBody<TSchema>
    }

    interface Exposure<TBody = {}, TFilters = {}, TOptions = {}> {
      firewall?: TFirewall<TFilters, TOptions> | TFirewall<TFilters, TOptions>[]
      publication?: boolean // Boolean
      method?: boolean // Boolean
      blocking?: boolean // Boolean
      maxLimit?: number // Number
      maxDepth?: number // Number
      restrictedFields?: string[] // [String]
      restrictLinks?: string[] | ((...args: any[]) => any) // [String] or Function,
    }

    interface ASTToQueryOptions {
      maxLimit: number
      maxDepth: number
    }
  }

  export function setAstToQueryDefaults(
    options: Grapher.ASTToQueryOptions
  ): void

  export const db: Readonly<{
    [key: string]: Mongo.CollectionStatic
  }>

  export class MemoryResultCacher {
    constructor({ ttl }: { ttl: number })

    public fetch<TResult = {}>(
      cacheId: string,
      options: {
        query: any
        countCursor: any
      }
    ): TResult

    public storeData<T = {}>(cacheId: string, data: T): void
  }
}
