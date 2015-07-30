import Ember from "ember";
import {
    module, test
}
from 'qunit';
import startApp from '../helpers/start-app';
var App, store;

module('Notification Integration Tests', {
    beforeEach: function () {
        
        
    },
    afterEach: function () {
        Ember.run(App, App.destroy);
        window.localStorage.clear();
        store = null;
    }
});


test('Notifications show up for batch download', function (assert) {
    var newAccount;
    App = startApp(null, assert);
    store = App.__container__.lookup('store:main');

    Ember.run(function () {
        newAccount = store.createRecord('account', {
            name: 'Testaccount',
            key: 'n+ufPpP3UwY+REvC3/zqBmHt2hCDdI06tQI5HFN7XnpUR5VEKMI+8kk/ez7QLQ3Cmojt/c1Ktaug3nK8FC8AeA==',
            active: true
        });
        newAccount.save();
    });

    andThen(function () {
        visit('/').then(function () {
            return visit('/explorer');
        })
        .then(function () {
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
