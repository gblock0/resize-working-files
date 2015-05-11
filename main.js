/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define, $, brackets, window */

/** 
* Bracket extension to make the Working Files pane in the sidebar resizable
*
* Greg Block (gblock0@gmail.com)
*/
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

	// set handlers when preferences are changed

	prefs.definePreference('resizeWorkingFiles', 'boolean', 'true').on('change', function () {
		CommandManager.get('block.resize-working-files').setChecked(prefs.get('resizeWorkingFiles'));

		Resizer.removeSizable($('#working-set-list-container'));
		var numPanes = MainViewManager.getPaneCount(),
			sizeForOpenFilesContainer = 0,
			$openFilesContainer = $('.open-files-container'),
			i;

		if (prefs.get('resizeWorkingFiles')) {
			Resizer.makeResizable($('#working-set-list-container'), "vert", "bottom", 75);
			MainViewManager.on("paneCreate", function (e, paneId) {
				numPanes = MainViewManager.getPaneCount();
			});
			MainViewManager.on("paneDestroy", function (e, paneId) {
				numPanes = MainViewManager.getPaneCount();
			});
			$('#working-set-list-container').on('panelResizeUpdate', function (element, newSize) {
				sizeForOpenFilesContainer = newSize / numPanes;
				for (i = 0; i < numPanes; i++) {
					$openFilesContainer[i].style.setProperty('height', sizeForOpenFilesContainer - 38 + "px");
				}
			});
		}
	});
});
