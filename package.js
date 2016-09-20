Package.describe({
    name: 'cultofcoders:grapher',
    version: '1.0.8',
    // Brief, one-line summary of the package.
    summary: 'Grapher is a way of linking/joining collections. And fetching data in a GraphQL style.',
    // URL to the Git repository containing the source code for this package.
    git: 'https://github.com/cult-of-coders/grapher',
    // By default, Meteor will default to using README.md for documentation.
    // To avoid submitting documentation, set this field to null.
    documentation: 'README.md'
});

Package.onUse(function (api) {
    api.versionsFrom('1.3');

    var packages = [
        'ecmascript',
        'underscore',
        'aldeed:simple-schema@1.5.3',
        'aldeed:collection2@2.10.0',
        'matb33:collection-hooks@0.8.4',
        'reywood:publish-composite@1.4.2',
        'dburles:mongo-collection-instances@0.3.5',
        'mongo'
    ];

    api.use(packages);
    api.imply(packages);

    api.mainModule('main.client.js', 'client');
    api.mainModule('main.server.js', 'server');
    api.mainModule('main.both.js');
});

Package.onTest(function (api) {
    api.use('cultofcoders:grapher');

    api.use('ecmascript');
    api.use('tracker');
    api.use('practicalmeteor:mocha');
    api.use('practicalmeteor:chai');

    api.mainModule('lib/links/tests/main.js', 'server');

    api.addFiles(['lib/query/tests/bootstrap.js']);
    api.addFiles(['lib/query/tests/fixtures.js'], 'server');

    api.mainModule('lib/query/tests/client.test.js', 'client');
    api.mainModule('lib/query/tests/server.test.js', 'server');
});
