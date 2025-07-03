/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Robot Inc. 2025.
 *--------------------------------------------------------------------------------------------*/

/**
 * Event interfaces for type-safe event handling
 */
export interface UIEvents {
	modalSelected: { modalTitle: string };
	modalMinimized: { modalTitle: string };
	modalRestored: { modalTitle: string };
	modalClosed: { modalTitle: string };
	menuAction: { menu: string; action: string };
	brandingReset: {};
	launchpadToggle: {};
	createModal: {};
	restoreModal: { title: string };
}

/**
 * Modal definition interface
 */
export interface ModalDefinition {
	title: string;
	width: number;
	height: number;
	titleBarColor: string;
	icon: string;
}

/**
 * Position interface
 */
export interface Position {
	left: number;
	top: number;
}

/**
 * Size interface
 */
export interface Size {
	width: number;
	height: number;
}

/**
 * Modal state interface
 */
export interface ModalState {
	isMinimized: boolean;
	isMaximized: boolean;
	isActive: boolean;
	zIndex: number;
	originalSize?: Size & Position;
}

/**
 * Event callback types
 */
export type EventCallback<T = any> = (data: T) => void;

/**
 * Menu action types
 */
export type MenuAction =
	| 'New Window'
	| 'Close Window'
	| 'Minimize All'
	| 'Restore All'
	| 'Bring All to Front'
	| 'Close All';

/**
 * Window control types
 */
export type WindowControlType = 'minimize' | 'maximize' | 'close';
