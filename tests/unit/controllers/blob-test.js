import Ember from 'ember';
import {
    moduleFor,
    test
}
from 'ember-qunit';
import startApp from 'azureexplorer/tests/helpers/start-app';

var App, store, ns;

moduleFor('controller:blob', {
    needs: ['util:filesize', 'model:container', 'model:blob', 'controller:notifications']
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

            containers.forEach(container => {
                container.get('blobs')
                .then(blobs => {

                    blobs.every(blob => {
                        blob.set('leaseStatus', 'locked');
                        blob.set('leaseState', 'unavailable');

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

test('it updates blob properties', function (assert) {
    combinedStart(assert);
    var self = this;
    assert.expect(11);
    Ember.run(() => {
        getBlobs()
        .then(blobs => {
            blobs.every(blob => {
                blob.set('contentLanguage', 'English');
                blob.set('contentDisposition', 'attachment');
                blob.set('leaseState', 'available');
                blob.set('leaseStatus', 'unlocked');
                let controller = self.subject({
                    model: blob
                });

                controller.get('notifications').addPromiseNotification = function (promise) {
                        
                    promise.then(() => {
                        assert.equal(controller.get('model.isDirty'), false);
                        assert.equal(controller.get('model.contentLanguage'), 'English');
                        assert.equal(controller.get('model.contentDisposition'), 'attachment');
                    });
                        
                };
                
                controller.send('setProperties');

                return false;
            });
        }); 
    });
});

test('it does not update blob properties', function (assert) {
    combinedStart(assert);
    var self = this;
    assert.expect(9);
    Ember.run(() => {
        getBlobs()
        .then(blobs => {
            blobs.every(blob => {
                blob.set('contentLanguage', 'English');
                blob.set('contentDisposition', 'attachment');
                blob.set('leaseState', 'available');
                blob.set('leaseStatus', 'unlocked');
                let controller = self.subject({
                    model: blob
                });

                controller.get('notifications').addObserver('notifications', () => {
                    assert(false, 'did not expect to see any attributes change');
                });
                controller.send('discardUnsavedChanges');
                
                assert.equal(controller.get('model.isDirty'), false);
                return false;
            });
        }); 
    });
});

test('it does not update a locked blob', function (assert) {
    combinedStart(assert);
    var self = this;
    assert.expect(9);
    Ember.run(() => {
        getBlobs()
        .then(blobs => {
            blobs.every(blob => {
                blob.set('contentLanguage', 'English');
                blob.set('contentDisposition', 'attachment');
                blob.set('leaseState', 'unavailable');
                blob.set('leaseStatus', 'locked');
                let controller = self.subject({
                    model: blob
                });

                controller.get('notifications').addObserver('notifications', () => {
                    assert(false, 'did not expect to see any attributes change');
                });
                controller.send('setProperties');
                
                assert.equal(controller.get('model.isDirty'), true);
                return false;
            });
        }); 
    });
});