import Ember from 'ember';
import Settings from '../models/settings';

export default Ember.Service.extend({
    nodeServices: Ember.inject.service(),
    notifications: Ember.inject.service(),
    fs: Ember.computed.alias('nodeServices.fs'),
    activeConnection: null,
    serviceSettings: null,
    lastError: '',
    disableTracking: false,
    settings: Settings.create(),

    /**
     * Returns the current application version number.
     */
    versionNumber: function () {
        var fs = this.get('fs');
        return fs.existsSync('version') ? fs.readFileSync('version', {encoding:'utf8'}) : 'unknown';
    }.property()
});
