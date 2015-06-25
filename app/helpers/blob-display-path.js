import Ember from 'ember';

export function blobDisplayPath(path, currentDirectory) {

   if (path === currentDirectory) {
      return currentDirectory;
   } else {
      return path.replace(currentDirectory, '');
   }

}

export default Ember.Handlebars.makeBoundHelper(blobDisplayPath);
