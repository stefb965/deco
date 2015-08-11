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