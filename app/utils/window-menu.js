/**
 * This setups NW.js's window menu
 * @param {boolean} handlers - Are tools available?
 */
function Menu(handlers) {
    var gui = window.requireNode('nw.gui'),
        open = window.requireNode('open'),
        menu = new gui.Menu({type: 'menubar'}),
        toolsEnabled = (handlers),
        seperator = () => {
            return new gui.MenuItem({type: 'separator'});
        };

    // Mac Menu
    if (process && process.platform === 'darwin') {
        menu.createMacBuiltin('Azure Storage Explorer');
    }

    // Blob & Container Tools
    let tools = new gui.MenuItem({label: 'Tools'});
    let toolsSubMenu = new gui.Menu();
    let toolsItems = {
        uploadBlob: new gui.MenuItem({label: 'Upload Blobs', enabled: toolsEnabled}),
        downloadBlobs: new gui.MenuItem({label: 'Download Blobs', enabled: toolsEnabled}),
        deleteBlobs: new gui.MenuItem({label: 'Delete Selected Blobs', enabled: toolsEnabled}),
        refreshBlobs: new gui.MenuItem({label: 'Refresh Blobs', enabled: toolsEnabled}),
        addContainer: new gui.MenuItem({label: 'Create Container', enabled: toolsEnabled}),
        removeContainer: new gui.MenuItem({label: 'Delete Current Container', enabled: toolsEnabled}),
        switchAccount: new gui.MenuItem({label: 'Switch Account', enabled: toolsEnabled})
    };

    // If we have handlers for the tools thing, add them
    if (handlers) {
        toolsItems.uploadBlob.click = handlers.uploadBlob;
        toolsItems.downloadBlobs.click = handlers.downloadBlobs;
        toolsItems.deleteBlobs.click = handlers.deleteBlobs;
        toolsItems.refreshBlobs.click = handlers.refreshBlobs;
        toolsItems.addContainer.click = handlers.addContainer;
        toolsItems.removeContainer.click = handlers.removeContainer;
        toolsItems.switchAccount.click = handlers.switchAccount;
    }

    toolsSubMenu.append(toolsItems.uploadBlob);
    toolsSubMenu.append(toolsItems.downloadBlobs);
    toolsSubMenu.append(toolsItems.deleteBlobs);
    toolsSubMenu.append(toolsItems.refreshBlobs);
    toolsSubMenu.append(seperator());
    toolsSubMenu.append(toolsItems.addContainer);
    toolsSubMenu.append(toolsItems.removeContainer);
    toolsSubMenu.append(seperator());
    toolsSubMenu.append(toolsItems.switchAccount);
    tools.submenu = toolsSubMenu;

    // Help Tools
    let help = new gui.MenuItem({label: 'Help'});
    let helpSubMenu = new gui.Menu();
    let helpItems = {
        homepage: new gui.MenuItem({
            label: 'Homepage',
            click: () => open('http://storageexplorer.com')
        }),
        storageDocumentation: new gui.MenuItem({
            label: 'Azure Storage Documentation',
            click: () => open('http://azure.microsoft.com/en-us/documentation/services/storage/')
        }),
        azureDocumentation: new gui.MenuItem({
            label: 'Azure Documentation',
            click: () => open('http://azure.microsoft.com/en-us/documentation/')
        }),
        reportIssues: new gui.MenuItem({
            label: 'Report Bugs & Issues',
            click: () => open('https://github.com/azure-storage/xplat/issues')
        }),
        emberInspector: new gui.MenuItem({
            label: 'Ember Inspector',
            click: function () {
                let s = document.createElement('script');
                s.src = 'http://ember-extension.s3.amazonaws.com/dist_bookmarklet/load_inspector.js';
                document.body.appendChild(s);
            }
        }),
        chromeTools: new gui.MenuItem({
            label: 'Chromium Tools',
            click: function () {
                require('nw.gui').Window.get().showDevTools();
            }
        })
    };

    helpSubMenu.append(helpItems.homepage);
    helpSubMenu.append(seperator());
    helpSubMenu.append(helpItems.storageDocumentation);
    helpSubMenu.append(helpItems.azureDocumentation);
    helpSubMenu.append(helpItems.reportIssues);
    helpSubMenu.append(seperator());
    helpSubMenu.append(helpItems.emberInspector);
    helpSubMenu.append(helpItems.chromeTools);
    help.submenu = helpSubMenu;

    menu.append(tools);
    menu.append(help);

    return menu;
}

var windowMenu = {
    /**
     * Attach the menu as nw.js' window menu
     * @param {boolean} handlers - Are tools available?
     */
    setup: function (handlers) {
        handlers = handlers || false;

        var gui = window.requireNode('nw.gui');
        var menu = new Menu(handlers);

        gui.Window.get().menu = menu;
    }
};

export default windowMenu;
