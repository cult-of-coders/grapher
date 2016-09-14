Package.describe({
    name: 'cultofcoders:grapher',
    version: '0.0.1',
    // Brief, one-line summary of the package.
    summary: '',
    // URL to the Git repository containing the source code for this package.
    git: '',
    // By default, Meteor will default to using README.md for documentation.
    // To avoid submitting documentation, set this field to null.
    documentation: 'README.md'
});

Package.onUse(function (api) {
    api.versionsFrom('1.4.1.1');

    var packages = [
        'ecmascript',
        'underscore',
        'aldeed:simple-schema',
        'aldeed:collection2@2.10.0',
        'matb33:collection-hooks',
        'reywood:publish-composite',
        'reactive-var',
        'mongo'
    ];

    api.use(packages);
    api.imply(packages);

    api.mainModule('main.both.js');
    api.mainModule('main.client.js', 'client');
    api.mainModule('main.server.js', 'server');
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
