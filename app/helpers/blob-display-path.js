import Ember from 'ember';

/**
 * Compares a path with the current directory
 * @param  {string} path
 * @param  {string} currentDirectory
 * @return {string}
 */
export default Ember.Helper.helper(function (params) {
    var path = (params && params.length > 0) ? params[0] : null, 
        currentDirectory = (params && params.length > 1) ? params[1] : null;
    return (path === currentDirectory) ? currentDirectory : path.replace(currentDirectory, '');
});
