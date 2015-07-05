import Ember from 'ember';

export default Ember.Controller.extend({
    fs: Ember.computed.alias('nodeServices.fs'),
    nodeServices: Ember.inject.service(),
    activeConnection: null,

    init: function () {
        // override the default drag & drop behavior
        window.ondrop = e => { e.preventDefault(); return false; };
        window.ondragover = e => { e.preventDefault(); return false; };
    },

    versionNumber: function () {
        var fs = this.get('fs');
        return fs.existsSync('version') ? fs.readFileSync('version', {encoding:'utf8'}) : 'unknown';
    }.property()
});
