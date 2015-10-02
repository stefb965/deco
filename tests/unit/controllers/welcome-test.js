import {moduleFor, test} from 'ember-qunit';
import Ember from 'ember';
import config from  '../../../config/environment';
import combinedStart from 'azureexplorer/tests/helpers/combined-start';

var globals = {
    App: null,
    store: null,
    send: null
};

moduleFor('controller:welcome', {
    needs: ['controller:application', 'route:welcome', 'route:application'],
});

function selectizeMock (target) {
    if (target === 'selectize') {
        return;
    }
    
    return globals.send.call(this, target);
}
// Replace this with your real tests.
test('edited values are saved', function (assert) {
    var ctrl = combinedStart(assert, globals, 1, this.subject());
    
    // save the original controllers send function    
    globals.send = ctrl.send;
    
    // hack
    ctrl.send = selectizeMock;
    
    // Test the controller calls the azure create container api.
    // We should see assetts come from the mock node service
    Ember.run(() => {
        globals.account.save();
        ctrl.send('toggleEdit');
        ctrl.set('selectedEditAccount', globals.account.id);
        ctrl.set('editAccountKey', 'RenamedAccountKey');
        
        ctrl.addObserver('selectedAccount', () => {
            globals.store.findRecord('account', ctrl.get('selectedAccount'))
            .then(record => {
               assert.equal(record.get('key'), 'RenamedAccountKey'); 
            });
        });
        
        ctrl.send('edit');
    });
});
