import { blobDisplayPath } from '../../../helpers/blob-display-path';
import { module, test } from 'qunit';

module('Unit | Helper | blob display path');

// Replace this with your real tests.
test('it works', function (assert) {
    var result = blobDisplayPath(['mydir/myblob.png', 'mydir/']);
    assert.ok(result === 'myblob.png');
});
