import Ember from 'ember';
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('ax-blob-properties', 'Integration | Component | ax blob properties', {
    integration: true
});

const Blob = Ember.Object.extend({});

test('it renders', function(assert) {
    assert.expect(1);

    this.render(hbs`{{ax-blob-properties}}`);

    assert.equal(this.$('div#modal-properties').length, 1);
});

test('it calculates pretty size', function (assert) {
    this.render(hbs `{{ax-blob-properties}}`);
    assert.equal(this.$(':contains("0.00 Bytes")').length, 6);
});

test('it calculates lock status correctly (unlocked)', function (assert) {
    let blobMock = Blob.create({leaseStatus: 'unlocked', leaseState: 'available'});

    this.render(hbs `{{ax-blob-properties blob=blobMock}}`);
    this.set('blobMock', blobMock);

    assert.equal(this.$(':contains("unlocked")').length, 6);
});

test('it calculates lock status correctly (locked)', function (assert) {
    let blobMock = Blob.create({leaseStatus: 'locked', leaseState: 'unavailable'});
    
    this.render(hbs `{{ax-blob-properties blob=blobMock}}`);
    this.set('blobMock', blobMock);

    assert.equal(this.$(':contains("locked")').length, 6);
});

// TODO: Integrate those tests
// test('it updates blob properties', function (assert) {
//     combinedStart(assert, globals, 11);

//     Ember.run(() => {
//         getBlobs().then(blobs => {
//             blobs.every(blob => {
//                 blob.set('contentLanguage', 'English');
//                 blob.set('contentDisposition', 'attachment');
//                 blob.set('leaseState', 'available');
//                 blob.set('leaseStatus', 'unlocked');
//                 let controller = this.subject({model: blob});

//                 controller.get('notifications').addPromiseNotification = function (promise) {
//                     promise.then(() => {
//                         assert.equal(controller.get('model.isDirty'), false);
//                         assert.equal(controller.get('model.contentLanguage'), 'English');
//                         assert.equal(controller.get('model.contentDisposition'), 'attachment');
//                     });
//                 };
                
//                 controller.send('setProperties');
//                 return false;
//             });
//         }); 
//     });
// });

// test('it does not update blob properties', function (assert) {
//     combinedStart(assert, globals, 9);

//     Ember.run(() => {
//         getBlobs().then(blobs => {
//             blobs.every(blob => {
//                 blob.set('contentLanguage', 'English');
//                 blob.set('contentDisposition', 'attachment');
//                 blob.set('leaseState', 'available');
//                 blob.set('leaseStatus', 'unlocked');
//                 let controller = this.subject({model: blob});

//                 controller.get('notifications').addObserver('notifications', () => {
//                     assert(false, 'did not expect to see any attributes change');
//                 });
//                 controller.send('discardUnsavedChanges');
                
//                 assert.equal(controller.get('model.isDirty'), false);
//                 return false;
//             });
//         }); 
//     });
// });

// test('it does not update a locked blob', function (assert) {
//     combinedStart(assert, globals, 9);

//     Ember.run(() => {
//         getBlobs().then(blobs => {
//             blobs.every(blob => {
//                 blob.set('contentLanguage', 'English');
//                 blob.set('contentDisposition', 'attachment');
//                 blob.set('leaseState', 'unavailable');
//                 blob.set('leaseStatus', 'locked');
//                 let controller = this.subject({model: blob});

//                 controller.get('notifications').addObserver('notifications', () => {
//                     assert(false, 'did not expect to see any attributes change');
//                 });
//                 controller.send('setProperties');
                
//                 assert.equal(controller.get('model.isDirty'), true);
//                 return false;
//             });
//         }); 
//     });
// });