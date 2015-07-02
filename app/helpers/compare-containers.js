import Ember from 'ember';

export function compareContainers(arg1, arg2) {
    return (arg1.get('name') === arg2);
}

export default Ember.Handlebars.makeBoundHelper(compareContainers);
