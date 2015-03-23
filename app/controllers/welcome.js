import Ember from 'ember';

export default Ember.Controller.extend({

    setup: function () {
        var model = this.get('model');

        if (!model || !model.content) {
            this.set('addNewUi', true);
        }
    }.on('init'),

    actions: {
        toggleAddNew: function () {
            this.toggleProperty('addNewUi');
        },

        addNew: function () {
            var name = this.get('account_name'),
                key = this.get('account_key'),
                domain = this.get('account_domain');

            var newAccount = this.store.createRecord('account', {
                name: name,
                key: key,
                domain: domain
            });

            newAccount.save();
        },

        test: function () {
            var name = this.get('account_name'),
                key = this.get('account_key'),
                domain = this.get('account_domain');
        }
    }
});
