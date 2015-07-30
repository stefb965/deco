import startApp from 'azureexplorer/tests/helpers/start-app';
import Ember from "ember";

/**
 * Setups the test
 * @param  {Object} assert     - Used to run startApp
 * @param  {Object} globals    - Store/App and other globals
 * @param  {number} expect     - Number of asserts to expect
 * @param  {Object} ctrl       - If set, it'll attach the store
 */
function combinedStart(assert, globals, expect, ctrl) {
    globals.App = startApp(null, assert);
    globals.store = globals.App.__container__.lookup('store:main');

    if (expect && Number.isInteger(expect)) {
        assert.expect(expect);
    }

    Ember.run(function () {
        var newAccount = globals.store.createRecord('account', {
            name: 'Testaccount',
            key: '5555-5555-5555-5555',
            active: true
        });
    });

    if (ctrl) {
        ctrl.store = globals.store;
        return ctrl;
    }
}

export default combinedStart;