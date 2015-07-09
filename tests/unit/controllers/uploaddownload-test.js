import Ember from "ember";
import {
    moduleFor, test
}
from 'ember-qunit';
import startApp from 'azureexplorer/tests/helpers/start-app';

var App, store;

function combinedStart(assert) {
    App = startApp(null, assert);
    store = App.__container__.lookup('store:main');
    Ember.run(function () {
        var newAccount = store.createRecord('account', {
            name: 'Testaccount',
            key: '5555-5555-5555-5555',
            active: true
        });
    });
}

moduleFor('controller:uploaddownload', {
    // Specify the other units that are required for this test.
    needs: ['controller:application', 'controller:notifications', 'controller:explorer', 'model:blob', 'model:container'],
    teardown: function () {
        Ember.run(App, App.destroy);
        window.localStorage.clear();
        store = null;
    }
});

test('it should upload file to blob', function (assert) {
    assert.expect(17);
    combinedStart(assert);

    var controller = this.subject();
    controller.store = store;
    
    Ember.run(() => {
        store.find('container').then(container => {
            controller.send('uploadBlobData', '/testdir/testfile.js;/testdir/testfile2.js;/testdir/testfile3.js', 'mydir1/', 'testcontainer');  
        });
    });
});

test('it should download blobs', function (assert) {
    assert.expect(62);
    combinedStart(assert);

    var controller = this.subject();
    controller.store = store;

    Ember.run(function () {
        store.find('container').then(function (containers) {
            containers.forEach(function (container) {
                container.get('blobs', {
                    prefix: '/'
                }).then(function (blobs) {
                    controller.send('streamBlobsToDirectory', blobs, './testdir', true);
                });
            });
        });
    });
});