import Ember from 'ember';
import config from './config/environment';

/**
 * Ember Router
 */
var Router = Ember.Router.extend({
    location: config.locationType
});

Router.map(function () {
    this.route('welcome');
    this.route('explorer');
});

export default Router;
