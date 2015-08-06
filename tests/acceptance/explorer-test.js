import Ember from "ember";
import { module, test } from 'qunit';
import startApp from '../helpers/start-app';
var App, store;

module('Integration | Route | Explorer', {
    afterEach: function() {
        Ember.run(this.application, 'destroy');
        this.store = null;
    }
});

test('Click on logo returns to home screen', function (assert) {
    this.application = startApp(null, assert, false);
    this.store = this.application.__container__.lookup('store:main');

    Ember.run(() => {
        let newAccount = this.store.createRecord('account', {
            name: 'Testaccount',
            key: 'n+ufPpP3UwY+REvC3/zqBmHt2hCDdI06tQI5HFN7XnpUR5VEKMI+8kk/ez7QLQ3Cmojt/c1Ktaug3nK8FC8AeA==',
            active: true
        });
        newAccount.save();
    });

    visit('/');

    andThen(function () {
        visit('/explorer').then(function () {
            return click('span[title="Switch Storage Account"]');
        }).then(function () {
            assert.equal(find('.welcome').length, 1);
        });
    });
});
