import Ember from 'ember';
import {
    moduleFor,
    test
}
from 'ember-qunit';

moduleFor('controller:blob', {
    needs: ['util:filesize']
});

test('it exists', function (assert) {
    var controller = this.subject({
        model: Ember.Object.create({
            size: 123456
        })
    });

    assert.ok(controller);
});