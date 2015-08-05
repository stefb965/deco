import Ember from 'ember';
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('ax-blob-tr', 'Integration | Component | ax blob tr', {
    integration: true
});

const Blob = Ember.Object.extend({});

test('it renders', function (assert) {
    this.render(hbs `{{ax-blob-tr}}`);
    assert.equal(this.$('tr').length, 1);
});

test('it calculates pretty size', function (assert) {
    this.render(hbs `{{ax-blob-tr}}`);
    assert.equal(this.$('td:contains("0.00 Bytes")').length, 1);
});

test('it calculates lock status correctly (unlocked)', function (assert) {
    let blobMock = Blob.create({leaseStatus: 'unlocked', leaseState: 'available'});

    this.render(hbs `{{ax-blob-tr blob=blobMock}}`);
    this.set('blobMock', blobMock);

    assert.equal(this.$('.mdi-action-lock-outline').length, 0);
});

test('it calculates lock status correctly (locked)', function (assert) {
    let blobMock = Blob.create({leaseStatus: 'locked', leaseState: 'unavailable'});

    
    this.render(hbs `{{ax-blob-tr blob=blobMock}}`);
    this.set('blobMock', blobMock);

    assert.equal(this.$('.mdi-action-lock-outline').length, 1);
});
