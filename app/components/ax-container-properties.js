import Ember from 'ember';
import Notification from '../models/notification';
import stringResources from '../utils/string-resources';

export default Ember.Component.extend({
	showProperties: true,

	showUpdateButton: true,

	accessTypes: ['OFF', 'BLOB', 'CONTAINER'],

	selectedAccessType: 'OFF',

	notifications: Ember.inject.service('notifications'),

	actions: {

		actionAccessControlLevel: function () {

            this.get('containerRecord').getAccessControlLevel()
            .then(result => {
                Ember.run.scheduleOnce('afterRender', this, () => {
                    Ember.$('select').material_select();
                });
                var acl = result.publicAccessLevel === null ? 'OFF' : result.publicAccessLevel;
                Ember.Logger.debug('getting acl of: ' + acl.toUpperCase());
                this.set('selectedAccessType', acl.toUpperCase());
                this.set('showProperties', false);
            });
		},

		actionProperties: function () {
			this.set('showProperties', true);
		},

		setAccessControlLevel: function () {
			var promise = this.get('containerRecord').setAccessControlLevel(this.get('selectedAccessType')),
				notification = Notification.create({
                    type: 'UpdateContainerACL',
                    text: stringResources.updateContainerACLMessage(this.get('containerRecord.name'))
                });
			this.get('notifications').addPromiseNotification(promise, notification);
		}
	}
});
