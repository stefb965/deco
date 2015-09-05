import Ember from 'ember';
import { module, test } from 'qunit';
import startApp from 'azureexplorer/tests/helpers/start-app';

module('Integration | Route | Welcome', {
    beforeEach: function() {
        this.application = startApp();
        this.store = this.application.__container__.lookup('store:main');
    },

    afterEach: function() {
        Ember.run(this.application, 'destroy');
        this.store = null;
    }
});

test('visiting /welcome', function(assert) {
    visit('/welcome');

    Ember.run(() => {
        return this.store.findAll('account').then(accounts => {
            accounts.content.forEach(account => {
                account.record.deleteRecord(); 
                account.record.save(); 
            });
        });     
    });

    andThen(function() {
        assert.equal(currentURL(), '/welcome');
    });
});

test('renders account selection div', function (assert) {
    visit('/welcome');

    andThen(function () {
        assert.equal(find('div.card-account').length, 1, 'Page contains account selection div');
    });
});

test('offers creation of a new account if none exists', function (assert) {
    assert.expect(3);
    visit('/welcome');

    andThen(function () {
        assert.equal(find('input#account_name').length, 1, 'Page contains account name input');
        assert.equal(find('input#account_key').length, 1, 'Page contains account key input');
        assert.equal(find('div#account_dnsSuffix').length, 1, 'Page contains account DNS suffix');
    });
});

test('displays available accounts if they exist', function (assert) {
    assert.expect(1);

    Ember.run(() => {
        let newAccount = this.store.createRecord('account', {
            name: 'Testaccount',
            key: 'n+ufPpP3UwY+REvC3/zqBmHt2hCDdI06tQI5HFN7XnpUR5VEKMI+8kk/ez7QLQ3Cmojt/c1Ktaug3nK8FC8AeA==',
            dnssuffix: ''
        });
        newAccount.save();
    });

    andThen(function () {
        visit('/welcome').then(function () {
            assert.equal(find('select').length, 1, 'Page contains account select');
        });
    });
});

test('displays edit account inputs', function (assert) {
    assert.expect(3);

    andThen(function () {
        visit('/welcome').then(function () {
            return click('.mdi-content-create');
        }).then(function () {
            assert.equal(find('#editAccountName').length, 1, 'Page contains edit account name input');
            assert.equal(find('#editAccountKey').length, 1, 'Page contains edit account key input');
            assert.equal(find('#editAccountDnsSuffix').length, 1, 'Page contains account DNS suffix');
        });
    });
});

test('check to see if modal error dialog is displayed', function(assert) {
    assert.expect(3);

    andThen(function () {
        visit('/welcome').then(function () {
            // this causes the 'save and open' button to be pushed.  since we don't have any accounts in the list then the modal error should display
            assert.equal(find('#modal-error').css('display'), 'none', 'Modal error dialog should not be visible');
            return click('.mdi-action-launch');
        }).then(function () {
            assert.equal(find('#modal-error').css('display'), 'block', 'Modal error dialog is now visible');
        }).then(function () {
            return click('.modal-close');
        }).then(function () {
            assert.equal(find('#modal-error').css('display'), 'none', 'Modal error dialog should now be dismissed');       
        });
    });
});


test('edited values are saved', function (assert) {
    assert.expect(1);

    andThen(function () {
        visit('/welcome').then(function () {
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
