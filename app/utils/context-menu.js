import Ember from 'ember';
import config from '../config/environment';

/**
 * This setups NW.js's context menu
 */
function Menu() {
    var gui = window.requireNode('nw.gui');
    var menu = new gui.Menu();

    // Commands
    var cut = new gui.MenuItem({
        label: 'Cut',
        click: function () {
            document.execCommand('cut');
        }
    });
    var copy = new gui.MenuItem({
        label: 'Copy',
        click: function () {
            document.execCommand('copy');
        }
    });
    var paste = new gui.MenuItem({
        label: 'Paste',
        click: function () {
            document.execCommand('paste');
        }
    });
    var emberInspector = new gui.MenuItem({
        label: 'Ember Inspector',
        click: function () {
            var s = document.createElement('script');
            s.src = 'http://ember-extension.s3.amazonaws.com/dist_bookmarklet/load_inspector.js';
            document.body.appendChild(s);
        }
    });
    var devTools = new gui.MenuItem({
        label: 'DevTools',
        click: function () {
            require('nw.gui').Window.get().showDevTools();
        }
    });

    menu.append(cut);
    menu.append(copy);
    menu.append(paste);

    if (config.environment === 'development' || config.environment === 'test') {
        menu.append(emberInspector);
        menu.append(devTools);
    }

    return menu;
}

var contextMenu = {
    /**
     * Changes the sorting of the blobs, using a given property
     */
    _setup_property_menu: function (e, menu) {
        var element = document.elementFromPoint(e.originalEvent.x, e.originalEvent.y),
                id = element.getAttribute('data-properties-id'),
                propModel = element.getAttribute('data-properties-model'),
                controllerName = element.getAttribute('data-properties-controller');

        if (id && propModel && controllerName) {
            var gui = window.requireNode('nw.gui');
            menu.append(new gui.MenuItem({
                label: 'Properties',
                click: function () {
                    var controller = window.Azureexplorer.__container__.lookup('controller:' + controllerName);

                    if (controller) {
                        controller.send('invokePropDialog', propModel, id);
                    }
                }
            }));
        }
    },

    /**
     * Listens to the contextmenu event to provide a customized context menu
     */
    setup: function () {
        Ember.$(document).on('contextmenu', (e) => {
            e.preventDefault();
            var menu = new Menu();
            this._setup_property_menu(e, menu);
            menu.popup(e.originalEvent.x, e.originalEvent.y);
        });
    }
};

export default contextMenu;
