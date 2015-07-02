import { compareContainers } from '../../../helpers/compare-containers';
import { module, test } from 'qunit';

module('Unit | Helper | compare containers');

// Replace this with your real tests.
test('it works', function(assert) {
  var result = compareContainers({ get: function(key) { return 'testcontainer'; } }, 'testcontainer');
  assert.ok(result);
});
