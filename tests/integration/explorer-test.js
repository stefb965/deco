import Ember from "ember";
import {
    module, test
}
from 'qunit';
import startApp from '../helpers/start-app';
var App, store;

module('Explorer Integration Tests', {
    beforeEach: function () {
        
        
    },
    afterEach: function () {
        Ember.run(App, App.destroy);
        window.localStorage.clear();
        store = null;
    }
});


test('Click on logo returns to home screen', function (assert) {
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
            return click('span[title="Switch Storage Account"]');
        })
        .then(function () {
            assert.equal(find('.welcome').length, 1);
        });
    });
});
