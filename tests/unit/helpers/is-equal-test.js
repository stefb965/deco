import { isEqual } from '../../../helpers/is-equal';
import { module, test } from 'qunit';

module('Unit | Helper | is equal');

// Replace this with your real tests.
test('it returns false for different objects', function(assert) {
  var obj1 = { name: 'object 1'},
      obj2 = { name: 'object 1'};
  var result = isEqual([obj1, obj2]);
  assert.equal(result, false);
});

test('it returns true for same obj', function(assert) {
  var obj1 = { name: 'object 1'},
      obj2 = obj1;

  var result = isEqual([obj1, obj2]);
  assert.equal(result, true);
});


test('it returns false for different numbers', function(assert) {
  var result = isEqual([42, 42]);
  assert.equal(result, true);
});
