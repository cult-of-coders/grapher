export default {
  fieldName: 'users',
  fieldNodes: [
    {
      kind: 'Field',
      name: { kind: 'Name', value: 'users', loc: { start: 6, end: 11 } },
      arguments: [],
      directives: [],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: {
              kind: 'Name',
              value: 'fullname',
              loc: { start: 12, end: 20 },
            },
            arguments: [],
            directives: [],
            loc: { start: 12, end: 20 },
          },
          {
            kind: 'Field',
            name: {
              kind: 'Name',
              value: 'comments',
              loc: { start: 21, end: 29 },
            },
            arguments: [
              {
                kind: 'Argument',
                name: {
                  kind: 'Name',
                  value: 'approved',
                  loc: { start: 30, end: 38 },
                },
                value: {
                  kind: 'BooleanValue',
                  value: true,
                  loc: { start: 39, end: 43 },
                },
                loc: { start: 30, end: 43 },
              },
            ],
            directives: [],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'Field',
                  name: {
                    kind: 'Name',
                    value: 'text',
                    loc: { start: 45, end: 49 },
                  },
                  arguments: [],
                  directives: [],
                  loc: { start: 45, end: 49 },
                },
                {
                  kind: 'Field',
                  name: {
                    kind: 'Name',
                    value: 'user',
                    loc: { start: 50, end: 54 },
                  },
                  arguments: [],
                  directives: [],
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      {
                        kind: 'Field',
                        name: {
                          kind: 'Name',
                          value: 'firstname',
                          loc: { start: 55, end: 64 },
                        },
                        arguments: [],
                        directives: [],
                        loc: { start: 55, end: 64 },
                      },
                    ],
                    loc: { start: 54, end: 65 },
                  },
                  loc: { start: 50, end: 65 },
                },
              ],
              loc: { start: 44, end: 66 },
            },
            loc: { start: 21, end: 66 },
          },
        ],
        loc: { start: 11, end: 67 },
      },
      loc: { start: 6, end: 67 },
    },
  ],
  returnType: '[User]',
  parentType: 'Query',
  path: { key: 'users' },
  schema: {
    _queryType: 'Query',
    _mutationType: 'Mutation',
    _subscriptionType: 'Subscription',
    _directives: [
      {
        name: 'skip',
        description:
          'Directs the executor to skip this field or fragment when the `if` argument is true.',
        locations: ['FIELD', 'FRAGMENT_SPREAD', 'INLINE_FRAGMENT'],
        args: [
          {
            name: 'if',
            description: 'Skipped when true.',
            type: 'Boolean!',
          },
        ],
      },
      {
        name: 'include',
        description:
          'Directs the executor to include this field or fragment only when the `if` argument is true.',
        locations: ['FIELD', 'FRAGMENT_SPREAD', 'INLINE_FRAGMENT'],
        args: [
          {
            name: 'if',
            description: 'Included when true.',
            type: 'Boolean!',
          },
        ],
      },
      {
        name: 'deprecated',
        description:
          'Marks an element of a GraphQL schema as no longer supported.',
        locations: ['FIELD_DEFINITION', 'ENUM_VALUE'],
        args: [
          {
            name: 'reason',
            description:
              'Explains why this element was deprecated, usually also including a suggestion for how to access supported similar data. Formatted in [Markdown](https://daringfireball.net/projects/markdown/).',
            type: 'String',
            defaultValue: 'No longer supported',
          },
        ],
      },
    ],
    astNode: {
      kind: 'SchemaDefinition',
      directives: [],
      operationTypes: [
        {
          kind: 'OperationTypeDefinition',
          operation: 'query',
          type: {
            kind: 'NamedType',
            name: {
              kind: 'Name',
              value: 'Query',
              loc: { start: 18, end: 23 },
            },
            loc: { start: 18, end: 23 },
          },
          loc: { start: 11, end: 23 },
        },
        {
          kind: 'OperationTypeDefinition',
          operation: 'mutation',
          type: {
            kind: 'NamedType',
            name: {
              kind: 'Name',
              value: 'Mutation',
              loc: { start: 36, end: 44 },
            },
            loc: { start: 36, end: 44 },
          },
          loc: { start: 26, end: 44 },
        },
        {
          kind: 'OperationTypeDefinition',
          operation: 'subscription',
          type: {
            kind: 'NamedType',
            name: {
              kind: 'Name',
              value: 'Subscription',
              loc: { start: 61, end: 73 },
            },
            loc: { start: 61, end: 73 },
          },
          loc: { start: 47, end: 73 },
        },
      ],
      loc: { start: 0, end: 75 },
    },
    _typeMap: {
      Query: 'Query',
      User: 'User',
      String: 'String',
      Boolean: 'Boolean',
      Comment: 'Comment',
      Mutation: 'Mutation',
      Subscription: 'Subscription',
      ReactiveEvent: 'ReactiveEvent',
      ID: 'ID',
      JSON: 'JSON',
      __Schema: '__Schema',
      __Type: '__Type',
      __TypeKind: '__TypeKind',
      __Field: '__Field',
      __InputValue: '__InputValue',
      __EnumValue: '__EnumValue',
      __Directive: '__Directive',
      __DirectiveLocation: '__DirectiveLocation',
      Date: 'Date',
    },
    _implementations: {},
    __validationErrors: [],
  },
  fragments: {},
  operation: {
    kind: 'OperationDefinition',
    operation: 'query',
    variableDefinitions: [],
    directives: [],
    selectionSet: {
      kind: 'SelectionSet',
      selections: [
        {
          kind: 'Field',
          name: {
            kind: 'Name',
            value: 'users',
            loc: { start: 6, end: 11 },
          },
          arguments: [],
          directives: [],
          selectionSet: {
            kind: 'SelectionSet',
            selections: [
              {
                kind: 'Field',
                name: {
                  kind: 'Name',
                  value: 'fullname',
                  loc: { start: 12, end: 20 },
                },
                arguments: [],
                directives: [],
                loc: { start: 12, end: 20 },
              },
              {
                kind: 'Field',
                name: {
                  kind: 'Name',
                  value: 'comments',
                  loc: { start: 21, end: 29 },
                },
                arguments: [
                  {
                    kind: 'Argument',
                    name: {
                      kind: 'Name',
                      value: 'approved',
                      loc: { start: 30, end: 38 },
                    },
                    value: {
                      kind: 'BooleanValue',
                      value: true,
                      loc: { start: 39, end: 43 },
                    },
                    loc: { start: 30, end: 43 },
                  },
                ],
                directives: [],
                selectionSet: {
                  kind: 'SelectionSet',
                  selections: [
                    {
                      kind: 'Field',
                      name: {
                        kind: 'Name',
                        value: 'text',
                        loc: { start: 45, end: 49 },
                      },
                      arguments: [],
                      directives: [],
                      loc: { start: 45, end: 49 },
                    },
                    {
                      kind: 'Field',
                      name: {
                        kind: 'Name',
                        value: 'user',
                        loc: { start: 50, end: 54 },
                      },
                      arguments: [],
                      directives: [],
                      selectionSet: {
                        kind: 'SelectionSet',
                        selections: [
                          {
                            kind: 'Field',
                            name: {
                              kind: 'Name',
                              value: 'firstname',
                              loc: {
                                start: 55,
                                end: 64,
                              },
                            },
                            arguments: [],
                            directives: [],
                            loc: {
                              start: 55,
                              end: 64,
                            },
                          },
                        ],
                        loc: { start: 54, end: 65 },
                      },
                      loc: { start: 50, end: 65 },
                    },
                  ],
                  loc: { start: 44, end: 66 },
                },
                loc: { start: 21, end: 66 },
              },
            ],
            loc: { start: 11, end: 67 },
          },
          loc: { start: 6, end: 67 },
        },
      ],
      loc: { start: 5, end: 68 },
    },
    loc: { start: 0, end: 68 },
  },
  variableValues: {},
};
