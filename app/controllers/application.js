import Ember from 'ember';

/**
 * Ember's application controller.
 * @param {Account record} activeConnection - The currently active connection
 */
export default Ember.Controller.extend({
    fs: Ember.computed.alias('nodeServices.fs'),
    nodeServices: Ember.inject.service(),
    activeConnection: null,
    lastError: '',
    disableTracking: false,

    /**
     * Init function, run on application launch: overrides the default drag & drop behavior
     */
    init: function () {
        this._super();

        window.ondrop = e => { e.preventDefault(); return false; };
        window.ondragover = e => { e.preventDefault(); return false; };

        if (!this.store) {
            return;
        }

        this.store.find('setting').then(result => {
            if (!result || !result.content || result.content.length < 1) {
                let settings = this.store.createRecord('setting', {firstUse: false});
                settings.save();

                Ember.run.schedule('afterRender', () => {
                    this.send('openFirstUseModal');
                });
            } else {
                if (result.content[0].get('firstUse')) {
                    // This should be impossible, but it's worth checking
                    Ember.run.schedule('afterRender', () => {
                        this.send('openFirstUseModal');
                    });
                    result.content[0].set('firstUse', false);
                }

                if (result.content[0].get('allowUsageStatistics') !== true) {
                    console.log('Disabling anonymized usage tracking');
                    this.send('disableAppInsights');
                }
            }
        });
    },

    /**
     * Returns the current version number.
     */
    versionNumber: function () {
        var fs = this.get('fs');
        return fs.existsSync('version') ? fs.readFileSync('version', {encoding:'utf8'}) : 'unknown';
    }.property()
});
