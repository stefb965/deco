import Ember from 'ember';

/**
 * The reusable navbar modal
 */
export default Ember.View.extend({
	modalTitle: '',
	templateName: '_modal_navbar',
	tabsArray: function () {
		var index = 1,
			tabs = [];

		while (this.get('tab' + index)) {
			tabs.push({
				name: this.get('tab' + index),
				action: 'action' + this.get('tab' + index)
			});
			index += 1;
		}

		return tabs;
	}.property('tabs')
});
