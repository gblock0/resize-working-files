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

		if (prefs.get('resizeWorkingFiles')) {
			Resizer.makeResizable($('#working-set-list-container'), "vert", "bottom", 75);
			$('#working-set-list-container').on('panelResizeUpdate', function (element, newSize) {
				$('.open-files-container')[0].style.setProperty('height', newSize - 38 + "px");
			});
		}
	});
});
