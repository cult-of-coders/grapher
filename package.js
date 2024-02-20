Package.describe({
  name: 'cultofcoders:grapher',
  version: '1.5.0',
  // Brief, one-line summary of the package.
  summary: 'Grapher is a data fetching layer on top of Meteor',
  // URL to the Git repository containing the source code for this package.
  git: 'https://github.com/cult-of-coders/grapher',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: 'README.md',
});

const npmPackages = {
  sift: '15.0.0',
  'dot-object': '1.9.0',
  'lodash.clonedeep': '4.5.0',
  'deep-extend': '0.6.0',
};

Package.onUse(function (api) {
  Npm.depends(npmPackages);

  api.versionsFrom(['2.8.1', '2.9.1', '3.0-beta.0']);

  var packages = [
    'ecmascript',
    'underscore',
    'promise',
    'check',
    'reactive-var',
    'zodern:types',
    'mongo',

    // https://github.com/Meteor-Community-Packages/meteor-collection-hooks/
    'matb33:collection-hooks@1.3.1',

    // https://github.com/Meteor-Community-Packages/meteor-publish-composite
    'reywood:publish-composite@1.8.6',

    // Note: not working
    // https://github.com/Meteor-Community-Packages/mongo-collection-instances
    'dburles:mongo-collection-instances@1.0.0-beta300.1',

    // Note: seems to be not working. Getting weird conflict that cultofcoders:grapher@1.5.0 depends on version 0.1.0
    // https://github.com/peerlibrary/meteor-subscription-scope
    // 'peerlibrary:subscription-scope@0.5.0',

    // Note: not working
    // https://github.com/Meteor-Community-Packages/denormalize/
    // 'herteby:denormalize@0.6.7',
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
    'matb33:collection-hooks@1.3.1',
    'reywood:publish-composite@1.8.6',
    'dburles:mongo-collection-instances@1.0.0-beta300.1',
    // 'herteby:denormalize@0.6.7',
    'mongo',
  ];

  api.use(packages);
  api.use('tracker');

  api.use(['meteortesting:mocha']);

  // LINKS
  api.addFiles('lib/links/tests/main.js', 'server');
  // api.addFiles('lib/links/tests/client.test.js', 'client');

  // EXPOSURE
  api.addFiles('lib/exposure/testing/server.js', 'server');
  // api.addFiles('lib/exposure/testing/client.js', 'client');

  // QUERY
  // api.addFiles('lib/query/testing/bootstrap/index.js');

  // When you play with tests you should comment this to make tests go faster.
  // api.addFiles('lib/query/testing/bootstrap/fixtures.js', 'server');

  // api.addFiles('lib/query/testing/server.test.js', 'server');
  // api.addFiles('lib/query/testing/client.test.js', 'client');

  // NAMED QUERY
  // api.addFiles('lib/namedQuery/testing/bootstrap/both.js');
  // api.addFiles('lib/namedQuery/testing/bootstrap/client.js', 'client');
  // api.addFiles('lib/namedQuery/testing/bootstrap/server.js', 'server');

  // REACTIVE COUNTS
  // api.addFiles('lib/query/counts/testing/server.test.js', 'server');
  // api.addFiles('lib/query/counts/testing/client.test.js', 'client');

  // NAMED QUERIES
  // api.addFiles('lib/namedQuery/testing/server.test.js', 'server');
  // api.addFiles('lib/namedQuery/testing/client.test.js', 'client');

  // GRAPHQL
  // api.addFiles('lib/graphql/testing/index.js', 'server');
});
