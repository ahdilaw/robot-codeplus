/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Robot Inc. 2025.
 *--------------------------------------------------------------------------------------------*/

// Core UI components
export { CustomUIManager } from './customUIManager.js';
export { TitleBarManager } from './titleBar.js';
export { ModalManager } from './modalManager.js';
export { ModalWindow } from './modalWindow.js';
export { Dock } from './dock.js';
export { Launchpad } from './launchpad.js';

// Utilities and shared code
export { DOMUtils, EventUtils } from './utils.js';
export { StyleTemplates } from './styles.js';
export { UI_CONSTANTS, CSS_CLASSES, MODAL_ICONS } from './constants.js';

// Types
export type {
	UIEvents,
	ModalDefinition,
	Position,
	Size,
	ModalState,
	EventCallback,
	MenuAction,
	WindowControlType
} from './types.js';
