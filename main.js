/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define, $, brackets */

/**
* Bracket extension to make the Working Files pane in the sidebar resizable
*
* Greg Block (gblock0@gmail.com)
*/

/**
*
* Private function to resize $('.open-files-container')
*
**/
function _resizeOpenFilesContainer(paneCount, containerSize) {
    'use strict';

    var sizeForOpenFilesContainer = containerSize / paneCount,
        $openFilesContainer = $('.open-files-container'),
        newHeight = 0,
        i;

    for (i = 0; i < paneCount; i++) {
        newHeight = sizeForOpenFilesContainer - 38;
        $openFilesContainer[i].style.setProperty('height', newHeight + "px");
    }
}

function _makeOpenFilesContainerScrollable(paneCount) {
    var $openFilesContainer = $('.open-files-container');

    if (!paneCount) {
        $openFilesContainer.each(function(i){
            $openFilesContainer[i].style.setProperty('overflow-y', 'hidden');
        });
    } else {
        $openFilesContainer.each(function(i){
            $openFilesContainer[i].style.setProperty('overflow-y', 'scroll');
        });
    }
}

/**
*
* Define the extension
*
**/
define(function (require, exports, module) {
    "use strict";

    var Resizer = brackets.getModule("utils/Resizer");

    var CommandManager = brackets.getModule("command/CommandManager"),
        Menus = brackets.getModule("command/Menus"),
        PreferencesManager = brackets.getModule("preferences/PreferencesManager"),
        prefs = PreferencesManager.getExtensionPrefs("resizeWorkingFiles"),
        menu = Menus.getMenu(Menus.AppMenuBar.VIEW_MENU),
        MainViewManager = brackets.getModule("view/MainViewManager"),
        ExtensionUtils = brackets.getModule("utils/ExtensionUtils");

    ExtensionUtils.loadStyleSheet(module, "main.css");

    // fix width of current working file selection when resizing the working files panel
    var sidebar_selection = $('.sidebar-selection');
    sidebar_selection[0].style.setProperty('width', '100%', 'important');

    // menu handler
    CommandManager.register("Resize Working Files", 'block.resize-working-files', function () {
        prefs.set('resizeWorkingFiles', !prefs.get('resizeWorkingFiles'));
        prefs.save();
    });
    menu.addMenuItem('block.resize-working-files');

    CommandManager.register("Scroll Working Files", 'block.scroll-working-files', function () {
        prefs.set('scrollWorkingFiles', !prefs.get('scrollWorkingFiles'));
        prefs.save();
    });
    menu.addMenuItem('block.scroll-working-files');

    // set handlers when preferences are changed

    prefs.definePreference('scrollWorkingFiles', 'boolean', 'true').on('change', function(){
        CommandManager.get('block.scroll-working-files').setChecked(prefs.get('scrollWorkingFiles'));

        _makeOpenFilesContainerScrollable(null);

        var numPanes = MainViewManager.getPaneCount();

        if (prefs.get('scrollWorkingFiles')) {
            _makeOpenFilesContainerScrollable(numPanes);
            $('.open-files-container').each(function(i){
                $('.open-files-container')[i].style.setProperty('height', (($('#working-set-list-container')[0].offsetHeight / numPanes) - 38) + "px");
            });
        }
    });

    prefs.definePreference('resizeWorkingFiles', 'boolean', 'true').on('change', function () {
        CommandManager.get('block.resize-working-files').setChecked(prefs.get('resizeWorkingFiles'));

        Resizer.removeSizable($('#working-set-list-container'));

        var numPanes = MainViewManager.getPaneCount(),
            workingFilesPaneSize = 0,
            scroll = prefs.get('scrollWorkingFiles');

        if (prefs.get('resizeWorkingFiles')) {
            Resizer.makeResizable($('#working-set-list-container'), "vert", "bottom", 75);

            MainViewManager.on("paneCreate", function () {
                numPanes = MainViewManager.getPaneCount();
                _resizeOpenFilesContainer(numPanes, workingFilesPaneSize);
                if (scroll) {
                    _makeOpenFilesContainerScrollable(numPanes, workingFilesPaneSize);
                }
            });

            MainViewManager.on("paneDestroy", function () {
                numPanes = MainViewManager.getPaneCount();
                _resizeOpenFilesContainer(numPanes, workingFilesPaneSize);
                if (scroll) {
                    _makeOpenFilesContainerScrollable(numPanes, workingFilesPaneSize);
                }
            });

            $('#working-set-list-container').on('panelResizeUpdate', function (element, newSize) {
                workingFilesPaneSize = newSize;
                _resizeOpenFilesContainer(numPanes, workingFilesPaneSize);
                if (scroll) {
                    _makeOpenFilesContainerScrollable(numPanes, workingFilesPaneSize);
                }
            });
        }
    });
});
