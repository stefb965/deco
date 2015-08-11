import Ember from 'ember';
import { moduleFor, test } from 'ember-qunit';
import combinedStart from 'azureexplorer/tests/helpers/combined-start';

var globals = {
    App: null,
    store: null
};

moduleFor('controller:uploaddownload', {
    // Specify the other units that are required for this test.
    needs: ['controller:application', 'service:notifications', 'controller:explorer', 'model:blob', 'model:container'],
    teardown: function () {
        Ember.run(globals.App, globals.App.destroy);
        window.localStorage.clear();
        globals.store = null;
    }
});

test('it should upload file to blob', function (assert) {
    var ctrl = combinedStart(assert, globals, 17, this.subject());
    
    Ember.run(() => {
        globals.store.find('container').then(container => {
            ctrl.send('uploadBlobData', '/testdir/testfile.js;/testdir/testfile2.js;/testdir/testfile3.js', 'mydir1/', 'testcontainer');  
        });
    });
});

test('it should download blobs', function (assert) {
    var ctrl = combinedStart(assert, globals, 62, this.subject());

    Ember.run(function () {
        globals.store.find('container').then(function (containers) {
            containers.forEach(function (container) {
                container.get('blobs', {prefix: '/'}).then(function (blobs) {
                    ctrl.send('streamBlobsToDirectory', blobs, './testdir', true);
                });
            });
        });
    });
});