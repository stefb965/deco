import Ember from 'ember';
import Resolver from 'ember/resolver';
import loadInitializers from 'ember/load-initializers';
import config from './config/environment';
import containerAdapter from './adapters/container';
import blobAdapter from './adapters/blob';
Ember.MODEL_FACTORY_INJECTIONS = true;

var App = Ember.Application.extend({
  modulePrefix: config.modulePrefix,
  podModulePrefix: config.podModulePrefix,
  Resolver: Resolver
});


loadInitializers(App, config.modulePrefix);
App.ContainerAdapter = containerAdapter;
App.BlobAdapter = blobAdapter;
export default App;
