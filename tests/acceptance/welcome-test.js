import Ember from 'ember';
import { module, test } from 'qunit';
import startApp from 'azureexplorer/tests/helpers/start-app';

function createNewAccount(context) {
        Ember.run(() => {
    let newAccount = context.store.createRecord('account', {
        name: 'Testaccount',
        key: 'n+ufPpP3UwY+REvC3/zqBmHt2hCDdI06tQI5HFN7XnpUR5VEKMI+8kk/ez7QLQ3Cmojt/c1Ktaug3nK8FC8AeA==',
        dnsSuffix: '',                
        active: true
    });
    newAccount.save();
    });
}

function deleteAccounts(context) {
        Ember.run(() => {
        return context.store.findAll('account').then(accounts => {
            accounts.content.forEach(account => {
                account.record.deleteRecord(); 
                account.save().then(() => {
                account.record.save(); 
            });
        });     
    });
    });
}

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
    
    // delete any accounts
    deleteAccounts(this);

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
    
    // delete any accounts
    deleteAccounts(this);
    
    andThen(function () {
        visit('/welcome')
        .then(function () {
            assert.equal(find('#account_name').length, 1, 'Page contains account name input');
            assert.equal(find('#account_key').length, 1, 'Page contains account key input');
            assert.equal(find('#account_dnsSuffix').length, 1, 'Page contains account DNS suffix');
        });    
    });
    
});

test('displays available accounts if they exist', function (assert) {
    assert.expect(1);
    
    // first add an account
    createNewAccount(this);

    andThen(function () {
        visit('/welcome').then(function () {
            assert.equal(find('select').length, 1, 'Page contains account select');
        });
    });
});

test('displays edit account inputs', function (assert) {
    assert.expect(3);

    // first add an account
    createNewAccount(this);

    andThen(function () {
        visit('/welcome').then(function () {
            return click('.editButton');
        }).then(function () {
            assert.equal(find('#editAccountName').length, 1, 'Page contains edit account name input');
            assert.equal(find('#editAccountKey').length, 1, 'Page contains edit account key input');
            assert.equal(find('#editAccountDnsSuffix').length, 1, 'Page contains account DNS suffix');
        });
    });
});

test('check to see if modal error dialog is displayed', function(assert) {
    assert.expect(3);

    // first add an account
    createNewAccount(this);

    andThen(function () {
        visit('/welcome').then(function () {
            // this causes the 'save' button to be pushed.  since we don't have any accounts in the list then the modal error should display
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
    
    var renamedAccountKey = null;
    var self = this;

    // first add an account
    createNewAccount(this);    
    
    andThen(function () {
        visit('/welcome').then(function () {
            return click('.editButton');
        }).then(function () {
            return fillIn('#edit_account_key', 'RenamedAccountKey');
        }).then(function () {
            return click('.editSaveButton');
        }).then(function () {
            Ember.run(() => {
                renamedAccountKey = self.store.peekAll('account').get('firstObject').get('key');
            });
            assert.equal(renamedAccountKey, 'RenamedAccountKey', 'Page contains option with updated account key');
        });
    });
});
