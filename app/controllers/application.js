import Ember from 'ember';
export default Ember.Controller.extend({
    fs: Ember.computed.alias('nodeServices.fs'),
    nodeServices: Ember.inject.service(),
    activeConnection: null,
    versionNumber: function () {
        var fs = this.get('fs');
        return fs.existsSync('version') ? fs.readFileSync('version', { encoding:'utf8' }) : 'unknown';
    }.property()
});
