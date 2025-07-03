/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Robot Inc. 2025.
 *--------------------------------------------------------------------------------------------*/

/**
 * UI Constants and Configuration
 */
export const UI_CONSTANTS = {
	// Layout dimensions
	TITLE_BAR_HEIGHT: 40,
	DOCK_BOTTOM_OFFSET: 20,
	MODAL_MIN_WIDTH: 300,
	MODAL_MIN_HEIGHT: 200,

	// Z-index layers
	Z_INDEX: {
		BACKGROUND: 1,
		MODAL_BASE: 100,
		DOCK: 9999,
		LAUNCHPAD: 10000,
		TITLE_BAR: 1000
	},

	// Animation durations (milliseconds)
	ANIMATION: {
		FAST: 200,
		NORMAL: 300,
		MODAL_MINIMIZE: 300,
		HOVER_TRANSITION: 100
	},

	// Colors
	COLORS: {
		TITLE_BAR_BG: 'rgba(246, 246, 246, 0.98)',
		CONTENT_BG: '#1e1e1e',
		MODAL_BG: '#2d2d30',
		MODAL_BORDER: '#3e3e42',
		ACCENT_BLUE: '#007aff',
		TEXT_PRIMARY: '#1d1d1f',
		TEXT_SECONDARY: '#666666',
		BACKGROUND_HELLO: '#333333'
	},

	// Typography
	FONTS: {
		SYSTEM: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
		FALLBACK: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
	}
} as const;

/**
 * Modal icon mappings
 */
export const MODAL_ICONS = {
	hello: '👋',
	small: '🔹',
	large: '🔷',
	new: '✨',
	settings: '⚙️',
	file: '📁',
	terminal: '💻',
	calculator: '🧮',
	text: '📝',
	editor: '📝',
	default: '□'
} as const;

/**
 * CSS class names for consistent styling
 */
export const CSS_CLASSES = {
	TITLE_BAR: 'custom-ui-title-bar',
	CONTENT_AREA: 'custom-ui-content-area',
	MODAL: 'custom-ui-modal',
	DOCK: 'custom-ui-dock',
	LAUNCHPAD: 'custom-ui-launchpad',
	MODAL_TAB: 'custom-ui-modal-tab'
} as const;
