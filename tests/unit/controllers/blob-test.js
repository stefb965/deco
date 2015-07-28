import Ember from 'ember';
import {
    moduleFor,
    test
}
from 'ember-qunit';
import startApp from 'azureexplorer/tests/helpers/start-app';

var App, store, ns;

moduleFor('controller:blob', {
    needs: ['util:filesize', 'model:container', 'model:blob']
});

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

function getBlobs() {
   return store.find('container')
    .then(function (containers) {
        console.log('running!');
        let retContainer = null;
        containers.every(container => {
            retContainer = container;
            return false;
        });

        return retContainer.get('blobs');
    });
}

test('it calculates pretty size', function (assert) {
    combinedStart(assert);
    var self = this;
    
    Ember.run(() => {
        getBlobs()
        .then(blobs => {
            console.log(blobs);
            blobs.forEach(blob => {
                blob.set('size', 12313435);

                let controller = self.subject({
                    model: blob
                });
                
                assert.ok(controller.get('prettySize') === '12.31 MB');
            });
        });
    });
});

test('it calculates lock status correctly (locked)', function (assert) {
    combinedStart(assert);
    var self = this;
    
    Ember.run(() => {
        store.find('container')
        .then(function (containers) {
            console.log('running!');
            containers.forEach(container => {
                container.get('blobs')
                .then(blobs => {
                    console.log(blobs);
                    blobs.every(blob => {
                        blob.set('leaseStatus', 'locked');
                        blob.set('leaseState', 'unavailable');
                        console.log('hello!');
                        let controller = self.subject({
                            model: blob
                        });

                        assert.equal(controller.get('isLocked'), true);
                        return false;
                    }); 
                });
            });
        });
    });
    
});

test('it calculates lock status correctly (unlocked)', function (assert) {
    combinedStart(assert);
    var self = this;
    
    Ember.run(() => {
        getBlobs()
        .then(blobs => {
            blobs.every(blob => {
                blob.set('leaseStatus', 'unlocked');
                blob.set('leaseState', 'available');

                let controller = self.subject({
                    model: blob
                });

                assert.equal(controller.get('isLocked'), false);
                
                return false;
            });
        }); 
    });
});