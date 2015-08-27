import Ember from 'ember';

export default Ember.Component.extend({
  content: null,

  selectedValue: Ember.computed.alias('value'),

  allowedOriginsString: function () {
    var origins = '';

    this.get('selectedValue.AllowedOrigins').each(host => {
      origins += host;
    });

    return origins;
  }.property('AllowedOrigins'),

  didInitAttrs() {
    this._super(...arguments);
    var content = this.get('content');

    if (!content) {
      this.set('content', []);
    }
  },

  actions: {
    change() {
      const selectedEl = this.$('select')[0];
      const selectedIndex = selectedEl.selectedIndex;
      const content = this.get('content');
      const selectedValue = content[selectedIndex];

      this.set('selectedValue', selectedValue);
      this.set('value', selectedValue);
    }
  }
});
