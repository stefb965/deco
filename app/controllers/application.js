import Ember from 'ember';

/**
 * Ember's application controller.
 * @param {Account record} activeConnection - The currently active connection
 */
export default Ember.Controller.extend({
    fs: Ember.computed.alias('nodeServices.fs'),
    nodeServices: Ember.inject.service(),
    activeConnection: null,

    /**
     * Init function, run on application launch: overrides the default drag & drop behavior
     * @return {[type]} [description]
     */
    init: function () {
        window.ondrop = e => { e.preventDefault(); return false; };
        window.ondragover = e => { e.preventDefault(); return false; };
    },

    /**
     * Returns the current version number.
     */
    versionNumber: function () {
        var fs = this.get('fs');
        return fs.existsSync('version') ? fs.readFileSync('version', {encoding:'utf8'}) : 'unknown';
    }.property()
});
