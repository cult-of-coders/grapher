Package.describe({
  name: 'cultofcoders:grapher',
  version: '2.0.0-rc.0',
  // Brief, one-line summary of the package.
  summary: 'Grapher is a data fetching layer on top of Meteor',
  // URL to the Git repository containing the source code for this package.
  git: 'https://github.com/cult-of-coders/grapher',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: 'README.md',
});

const npmPackages = {
  mingo: '6.6.0',
  'dot-object': '1.9.0',
  'lodash.clonedeep': '4.5.0',
  'deep-extend': '0.6.0',
};

Package.onUse(function (api) {
  Npm.depends(npmPackages);

  api.versionsFrom(['3.0.1', '3.1.2', '3.2']);

  var packages = [
    'ecmascript',
    'underscore',
    'check',
    'reactive-var',
    'zodern:types@1.0.13',
    'mongo',

    // https://github.com/Meteor-Community-Packages/meteor-collection-hooks/
    'matb33:collection-hooks@2.0.0',

    // https://github.com/Meteor-Community-Packages/meteor-publish-composite
    'reywood:publish-composite@1.9.0',

    // https://github.com/Meteor-Community-Packages/mongo-collection-instances
    'dburles:mongo-collection-instances@1.0.0',

    // https://github.com/harryadel/meteor-subscription-scope
    'harry97:subscription-scope@0.6.0',

    // https://github.com/Meteor-Community-Packages/denormalize/
    'herteby:denormalize@0.7.0',
  ];

  api.use(packages);

  api.mainModule('main.client.js', 'client');
  api.mainModule('main.server.js', 'server');
});

Package.onTest(function (api) {
  api.use('cultofcoders:grapher');


  Npm.depends({
    ...npmPackages,
    chai: '4.3.4',
  });

  var packages = [
    'random',
    'ecmascript',
    'underscore',
    'matb33:collection-hooks@2.0.0',
    'reywood:publish-composite@1.9.0',
    'dburles:mongo-collection-instances@1.0.0',
    'harry97:subscription-scope@0.5.0',
    'herteby:denormalize@0.7.0',
    'mongo',
  ];

  api.use(packages);
  api.use('tracker');

  api.use(['meteortesting:mocha@3.3.0-rc.0']);

  // LINKS
  api.addFiles('lib/links/tests/main.js', 'server');
  api.addFiles('lib/links/tests/client.test.js', 'client');

  // EXPOSURE
  api.addFiles('lib/exposure/testing/server.js', 'server');
  api.addFiles('lib/exposure/testing/client.js', 'client');

  // QUERY
  api.addFiles('lib/query/testing/bootstrap/index.js');

  // When you play with tests you should comment this to make tests go faster.
  api.addFiles('lib/query/testing/bootstrap/fixtures.js', 'server');

  api.addFiles('lib/query/testing/server.test.js', 'server');
  api.addFiles('lib/query/testing/client.test.js', 'client');

  // NAMED QUERY
  api.addFiles('lib/namedQuery/testing/bootstrap/both.js');
  api.addFiles('lib/namedQuery/testing/bootstrap/client.js', 'client');
  api.addFiles('lib/namedQuery/testing/bootstrap/server.js', 'server');

  // REACTIVE COUNTS
  api.addFiles('lib/query/counts/testing/server.test.js', 'server');
  api.addFiles('lib/query/counts/testing/client.test.js', 'client');

  // NAMED QUERIES
  api.addFiles('lib/namedQuery/testing/server.test.js', 'server');
  api.addFiles('lib/namedQuery/testing/client.test.js', 'client');

  // hypernova
  api.addFiles('lib/query/hypernova/testing/assembler.test.js', 'server');
  api.addFiles(
    'lib/query/hypernova/testing/processVirtualNode.test.js',
    'server',
  );

  // GRAPHQL
  api.addFiles('lib/graphql/testing/index.js', 'server');
});
