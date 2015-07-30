import Ember from "ember";
import { moduleFor, test } from 'ember-qunit';
import combinedStart from 'azureexplorer/tests/helpers/combined-start';

var globals = {
    App: null,
    store: null
};

moduleFor('controller:blob', {
    needs: ['util:filesize', 'model:container', 'model:blob', 'controller:notifications'],
    teardown: function () {
        Ember.run(globals.App, globals.App.destroy);
        window.localStorage.clear();
        globals.store = null;
    }
});

function getBlobs() {
    return globals.store.find('container').then(function (containers) {
        let retContainer = null;
        containers.every(container => {
            retContainer = container;
            return false;
        });

        return retContainer.get('blobs');
    });
}

test('it calculates pretty size', function (assert) {
    combinedStart(assert, globals);

    Ember.run(() => {
        getBlobs().then(blobs => {
            blobs.forEach(blob => {
                blob.set('size', 12313435);
                let controller = this.subject({model: blob});
                
                assert.ok(controller.get('prettySize') === '12.31 MB');
            });
        });
    });
});


test('it calculates lock status correctly (locked)', function (assert) {
    var ctrl = combinedStart(assert, globals, 16, this.subject());
    
    Ember.run(() => {
        globals.store.find('container').then(containers => {
            containers.forEach(container => {
                container.get('blobs').then(blobs => {
                    blobs.every(blob => {
                        blob.setProperties({leaseStatus: 'locked', leaseState: 'unavailable'});
                        let controller = this.subject({model: blob});

                        assert.equal(controller.get('isLocked'), true);
                        return false;
                    }); 
                });
            });
        });
    });
});

test('it calculates lock status correctly (unlocked)', function (assert) {
    combinedStart(assert, globals);
    
    Ember.run(() => {
        getBlobs().then(blobs => {
            blobs.every(blob => {
                blob.set('leaseStatus', 'unlocked');
                blob.set('leaseState', 'available');

                let controller = this.subject({model: blob});

                assert.equal(controller.get('isLocked'), false);
                return false;
            });
        }); 
    });
});

test('it updates blob properties', function (assert) {
    combinedStart(assert, globals, 11);

    Ember.run(() => {
        getBlobs().then(blobs => {
            blobs.every(blob => {
                blob.set('contentLanguage', 'English');
                blob.set('contentDisposition', 'attachment');
                blob.set('leaseState', 'available');
                blob.set('leaseStatus', 'unlocked');
                let controller = this.subject({model: blob});

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
    combinedStart(assert, globals, 9);

    Ember.run(() => {
        getBlobs().then(blobs => {
            blobs.every(blob => {
                blob.set('contentLanguage', 'English');
                blob.set('contentDisposition', 'attachment');
                blob.set('leaseState', 'available');
                blob.set('leaseStatus', 'unlocked');
                let controller = this.subject({model: blob});

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
    combinedStart(assert, globals, 9);

    Ember.run(() => {
        getBlobs().then(blobs => {
            blobs.every(blob => {
                blob.set('contentLanguage', 'English');
                blob.set('contentDisposition', 'attachment');
                blob.set('leaseState', 'unavailable');
                blob.set('leaseStatus', 'locked');
                let controller = this.subject({model: blob});

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