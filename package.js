Package.describe({
    name: 'cultofcoders:grapher',
    version: '1.3.13',
    // Brief, one-line summary of the package.
    summary: 'Grapher is a data fetching layer on top of Meteor',
    // URL to the Git repository containing the source code for this package.
    git: 'https://github.com/cult-of-coders/grapher',
    // By default, Meteor will default to using README.md for documentation.
    // To avoid submitting documentation, set this field to null.
    documentation: 'README.md',
});

Npm.depends({
    sift: '3.2.6',
    'dot-object': '1.5.4',
    'lodash.clonedeep': '4.5.0',
    'deep-extend': '0.5.0',
});

Package.onUse(function(api) {
    api.versionsFrom('1.3');

    var packages = [
        'ecmascript',
        'underscore',
        'promise',
        'check',
        'reactive-var',
        'mongo',
        'matb33:collection-hooks@0.8.4',
        'reywood:publish-composite@1.5.2',
        'dburles:mongo-collection-instances@0.3.5',
        'peerlibrary:subscription-scope@0.4.0',
        'herteby:denormalize@0.6.5',
    ];

    api.use(packages);

    api.mainModule('main.client.js', 'client');
    api.mainModule('main.server.js', 'server');
});

Package.onTest(function(api) {
    api.use('cultofcoders:grapher');

    var packages = [
        'random',
        'ecmascript',
        'underscore',
        'matb33:collection-hooks@0.8.4',
        'reywood:publish-composite@1.5.2',
        'dburles:mongo-collection-instances@0.3.5',
        'herteby:denormalize@0.6.5',
        'mongo',
    ];

    api.use(packages);
    api.use('tracker');

    api.use(['meteortesting:mocha']);

    // LINKS
    api.addFiles('lib/links/tests/main.js', 'server');

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

    // GRAPHQL
    api.addFiles('lib/graphql/testing/index.js', 'server');
});
