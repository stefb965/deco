import Ember from "ember";
import {
    module, test
}
from 'qunit';
import startApp from '../helpers/start-app';
var App, store;

module('Welcome & Account Selection', {
    beforeEach: function () {
        App = startApp();
        store = App.__container__.lookup('store:main');
    },
    afterEach: function () {
        Ember.run(App, App.destroy);
        window.localStorage.clear();
        store = null;
    }
});


test('renders account selection box', function (assert) {
    assert.expect(1);
    visit('/').then(function () {
        assert.equal(find('div.card-account').length, 1, 'Page contains account selection div');
    });
});

test('offers creation of a new account if none exists', function (assert) {
    assert.expect(2);
    visit('/').then(function () {
        assert.equal(find('input#account_name').length, 1, 'Page contains account name input');
        assert.equal(find('input#account_key').length, 1, 'Page contains account key input');
    });
});

test('displays available if accounts if they exist', function (assert) {
    var newAccount;

    assert.expect(1);

    Ember.run(function () {
        newAccount = store.createRecord('account', {
            name: 'Testaccount',
            key: 'n+ufPpP3UwY+REvC3/zqBmHt2hCDdI06tQI5HFN7XnpUR5VEKMI+8kk/ez7QLQ3Cmojt/c1Ktaug3nK8FC8AeA=='
        });
        newAccount.save();
    });

    andThen(function () {
        visit('/').then(function () {
            assert.equal(find('select').length, 1, 'Page contains account select');
        });
    });
});

test('displays edit account inputs', function (assert) {
    var newAccount;

    assert.expect(2);

    Ember.run(function () {
        newAccount = store.createRecord('account', {
            name: 'Testaccount',
            key: 'n+ufPpP3UwY+REvC3/zqBmHt2hCDdI06tQI5HFN7XnpUR5VEKMI+8kk/ez7QLQ3Cmojt/c1Ktaug3nK8FC8AeA=='
        });
        newAccount.save();
    });

    andThen(function () {
        visit('/').then(function () {
            return click('.mdi-content-create');
        }).then(function () {
            assert.equal(find('#editAccountName').length, 1, 'Page contains edit account name input');
            assert.equal(find('#editAccountKey').length, 1, 'Page contains edit account key input');
        });
    });
});

test('edited values are saved', function (assert) {
    var newAccount;

    assert.expect(1);

    Ember.run(function () {
        newAccount = store.createRecord('account', {
            name: 'Testaccount',
            key: 'n+ufPpP3UwY+REvC3/zqBmHt2hCDdI06tQI5HFN7XnpUR5VEKMI+8kk/ez7QLQ3Cmojt/c1Ktaug3nK8FC8AeA=='
        });
        newAccount.save();
    });

    andThen(function () {
        visit('/').then(function () {
            return click('.mdi-content-create');
        }).then(function () {
            return fillIn('#edit_account_key', '1+ufPpP3UwY+REvC3/zqBmHt2hCDdI06tQI5HFN7XnpUR5VEKMI+8kk/ez7QLQ3Cmojt/c1Ktaug3nK8FC8AeA==');
        }).then(function () {
            return fillIn('#edit_account_name', 'RenamedTestaccount');
        }).then(function () {
            return click('#editSave');
        }).then(function () {
            assert.equal(find('option:contains("RenamedTestaccount")').length, 1, 'Page contains option with updated account name');
        });
    });
});
