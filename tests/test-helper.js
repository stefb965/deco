import resolver from './helpers/resolver';
import Ember from 'ember';
import { setResolver } from 'ember-qunit';

Ember.deprecate = function() { };
Ember.warn = function() { };

setResolver(resolver);

