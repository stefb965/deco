import {
  moduleForComponent,
  test
} from 'ember-qunit';

import Ember from "ember";
import combinedStart from 'azureexplorer/tests/helpers/combined-start';

var globals = {
    App: null,
    store: null
};

moduleForComponent('ax-blob-properties', {
    needs: ['util:filesize', 'model:container', 'model:blob', 'service:notifications'],
    teardown: function () {
        Ember.run(globals.App, globals.App.destroy);
        window.localStorage.clear();
        globals.store = null;
    },
    unit: true
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
                let comp = this.subject({blob: blob});
                
                assert.ok(comp.get('prettySize') === '12.31 MB');
            });
        });
    });
});


test('it calculates lock status correctly (locked)', function (assert) {
    combinedStart(assert, globals, 9);
    
    Ember.run(() => {
        globals.store.find('container').then(containers => {
            let container = containers.get('firstObject');
            container.get('blobs').then(blobs => {
                let blob = blobs.get('firstObject');
                blob.setProperties({leaseStatus: 'locked', leaseState: 'unavailable'});
                let comp = this.subject({blob: blob});
                assert.equal(comp.get('isLocked'), true, 'expected lock status to be true');
            });
        });
    });
});

test('it calculates lock status correctly (unlocked)', function (assert) {
    combinedStart(assert, globals, 9);
    
    Ember.run(() => {
        getBlobs().then(blobs => {
            let blob = blobs.get('firstObject');
            blob.set('leaseStatus', 'unlocked');
            blob.set('leaseState', 'available');

            let comp = this.subject({blob: blob});

            assert.equal(comp.get('isLocked'), false);
            return false;
        }); 
    });
});

test('it updates blob properties', function (assert) {
    combinedStart(assert, globals, 11);

    Ember.run(() => {
        getBlobs().then(blobs => {
            let blob = blobs.get('firstObject');
            blob.set('contentLanguage', 'English');
            blob.set('contentDisposition', 'attachment');
            blob.set('leaseState', 'available');
            blob.set('leaseStatus', 'unlocked');
            let comp = this.subject({blob: blob});

            comp.get('notifications').addPromiseNotification = function (promise) {
                promise.then(() => {
                    assert.equal(comp.get('blob.isDirty'), false, 'expected isDirty to be false');
                    assert.equal(comp.get('blob.contentLanguage'), 'English', 'expected contentLanguage to be English');
                    assert.equal(comp.get('blob.contentDisposition'), 'attachment', 'expected blobcontentDisposition to be attachment');
                });
            };
            
            comp.send('setProperties');
            return false;
        }); 
    });
});

test('it does not update blob properties', function (assert) {
    combinedStart(assert, globals, 9);

    Ember.run(() => {
        getBlobs().then(blobs => {
            let blob = blobs.get('firstObject');
            blob.set('contentLanguage', 'English');
            blob.set('contentDisposition', 'attachment');
            blob.set('leaseState', 'available');
            blob.set('leaseStatus', 'unlocked');
            let controller = this.subject({blob: blob});

            controller.get('notifications').addObserver('notifications', () => {
                assert(false, 'did not expect to see any attributes change');
            });
            controller.send('discardUnsavedChanges');
            
            assert.equal(controller.get('blob.isDirty'), false, 'expected isDirty to be true');
            return false;
        }); 
    });
});

test('it does not update a locked blob', function (assert) {
    combinedStart(assert, globals, 9);

    Ember.run(() => {
        getBlobs().then(blobs => {
            let blob = blobs.get('firstObject');
            blob.set('contentLanguage', 'English');
            blob.set('contentDisposition', 'attachment');
            blob.set('leaseState', 'unavailable');
            blob.set('leaseStatus', 'locked');
            let comp = this.subject({blob: blob});

            comp.get('notifications').addObserver('notifications', () => {
                assert(false, 'did not expect to see any attributes change');
            });
            comp.send('setProperties');

            assert.equal(comp.get('blob.isDirty'), true);
            return false;
        }); 
    });
});

test('it generates an SAS url', function (assert) {
    combinedStart(assert, globals, 13);

    Ember.run(() => {
        getBlobs().then(blobs => {
            let blob = blobs.get('firstObject'),
                comp = this.subject({blob: blob});

            comp.addObserver('SAS', () => {
                assert.equal(typeof comp.get('SAS.url'), 'string');
                assert.ok(comp.get('SAS.url').indexOf('http') > -1);
                assert.equal(typeof comp.get('SAS.sas'), 'string');
            });
            comp.set('selectedSASOption', 'READ');
            comp.send('generateSAS');
            return false;
        }); 
    });
});