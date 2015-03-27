import {
  moduleForModel,
  test
} from 'ember-qunit';

moduleForModel('container', {
  // Specify the other units that are required for this test.
  needs: ['model:blob']
});

test('it should exist', function(assert) {

  var model = this.subject();
  assert.ok(!!model);
});
