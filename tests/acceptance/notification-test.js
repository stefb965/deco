import Ember from 'ember';
import { module, test } from 'qunit';
import startApp from 'azureexplorer/tests/helpers/start-app';

module('Integration | Notifications', {
    afterEach: function() {
        Ember.run(this.application, 'destroy');
        this.store = null;
    }
});

test('Notifications show up for batch download', function (assert) {
    this.application = startApp({}, assert);
    this.store = this.application.__container__.lookup('store:main');

    Ember.run(() => {
        this.store.findAll('account').then(accounts => {
            accounts.content.forEach(account => {
                account.record.deleteRecord(); 
                account.record.save(); 
            });
        });        
    });

    andThen(() => {
        Ember.run(() => {
            let newAccount = this.store.createRecord('account', {
                name: 'Testaccount',
                key: 'n+ufPpP3UwY+REvC3/zqBmHt2hCDdI06tQI5HFN7XnpUR5VEKMI+8kk/ez7QLQ3Cmojt/c1Ktaug3nK8FC8AeA==',
                dnsSuffix: '',                
                active: true
            });
            newAccount.save();
        });

        visit('/');
    });

    andThen(function () {
        visit('/explorer').then(function () {
            // replace file input as text box to avoid native dialog displaying
            Ember.$('#nwSaveDirectory').attr('type', 'text');
            Ember.$('#nwSaveInput').attr('type', 'text');
            // select all blobs
            return click('#selectAllCheckbox');
        })
        .then(function () {
            return click('.fa-download');
        })
        .then(function () {
            return triggerEvent('#nwSaveDirectory', 'change');
        })
        .then(function () {
            return click('.handle');
        })
        .then(function () {
            assert.equal(find('.mdi-action-done').length, 4);
        });
    });
});
