import Ember from 'ember';

/**
 * Compares two containers
 * @param  {DS.Record} arg1 - Container object
 * @param  {string} arg2    - Name of a container
 * @return {boolean}
 */
export function compareContainers(arg1, arg2) {
    return (arg1.get('name') === arg2);
}

export default Ember.Handlebars.makeBoundHelper(compareContainers);
