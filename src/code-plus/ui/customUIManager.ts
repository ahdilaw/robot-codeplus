/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { TitleBarManager } from './titleBar.js';
import { ModalManager } from './modalManager.js';
import { Dock } from './dock.js';
import { Launchpad, ModalDefinition } from './launchpad.js';

/**
 * Manages the custom UI that replaces the default VS Code workbench UI
 */
export class CustomUIManager {
	private titleBarManager: TitleBarManager;
	private modalManager: ModalManager;
	private dock: Dock;
	private launchpad: Launchpad;
	private mainContainer: HTMLElement;

	constructor(container: HTMLElement) {
		this.mainContainer = container;
		this.titleBarManager = new TitleBarManager();
		this.modalManager = new ModalManager();
		this.dock = new Dock();
		this.launchpad = new Launchpad();
	}

	/**
	 * Initialize and render the complete custom UI
	 */
	public initialize(): void {
		this.clearContainer();
		this.createLayout();
		this.setupEventHandlers();
	}

	private clearContainer(): void {
		// Clear the container using safe DOM methods
		while (this.mainContainer.firstChild) {
			this.mainContainer.removeChild(this.mainContainer.firstChild);
		}
	}

	private createLayout(): void {
		// Create the title bar
		const titleBar = this.titleBarManager.createTitleBar();

		// Create content area with background and modals
		const contentArea = this.createContentArea();

		// Add both to the main container
		this.mainContainer.appendChild(titleBar);
		this.mainContainer.appendChild(contentArea);

		// Add the dock to the main container
		this.mainContainer.appendChild(this.dock.getElement());

		// Add the launchpad overlay to the main container
		this.mainContainer.appendChild(this.launchpad.getElement());

		// Set main container styles
		this.mainContainer.style.cssText = 'height: 100vh; margin: 0; padding: 0; overflow: hidden;';
	}

	private createContentArea(): HTMLElement {
		const contentArea = document.createElement('div');
		contentArea.className = 'custom-ui-content-area'; // Add a class for easier selection
		contentArea.style.cssText = 'height: calc(100vh - 35px); display: flex; justify-content: center; align-items: center; background: #1e1e1e; position: relative;';

		// Add background HELLO message (lowest z-index)
		const backgroundHello = document.createElement('h1');
		backgroundHello.textContent = 'HELLO WALI';
		backgroundHello.style.cssText = 'color: #333333; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; font-size: 120px; margin: 0; position: absolute; z-index: 1; pointer-events: none; opacity: 0.3;';
		contentArea.appendChild(backgroundHello);

		// No default modals - they will be created when launched from the launchpad

		return contentArea;
	}

	private setupEventHandlers(): void {
		// Set up communication between title bar and modal manager
		this.titleBarManager.onMenuAction((menu: string, action: string) => {
			this.handleMenuAction(menu, action);
		});

		// Set up modal selection handlers
		this.modalManager.onModalSelected((modalTitle: string) => {
			this.titleBarManager.updateActiveModal(modalTitle);
		});

		// Set up dock event handlers
		this.dock.onCreateModal(() => {
			// Show launchpad instead of creating a generic modal
			this.launchpad.show();
		});

		this.dock.onRestoreModal((title: string) => {
			this.modalManager.restoreModalByTitle(title);
		});

		// Set up modal manager dock callbacks
		this.modalManager.onModalMinimized((title: string) => {
			this.dock.addMinimizedModal(title, this.getModalIcon(title));
		});

		this.modalManager.onModalRestoredFromDock((title: string) => {
			this.dock.removeModal(title);
		});

		this.modalManager.onModalClosed((title: string) => {
			this.dock.removeModal(title);
		});

		// Listen for modal close events on the container
		this.mainContainer.addEventListener('modalClose', (event: Event) => {
			const customEvent = event as CustomEvent;
			if (customEvent.detail?.modal) {
				this.modalManager.closeModal(customEvent.detail.modal);
			}
		});

		// Handle background clicks to reset branding
		this.mainContainer.addEventListener('click', (event: MouseEvent) => {
			const target = event.target as HTMLElement;

			// Check if the click was on the background (content area) and not on a modal
			const contentArea = this.mainContainer.querySelector('.custom-ui-content-area') as HTMLElement;
			if (target === contentArea) {
				// Reset to default branding when background is clicked
				this.titleBarManager.resetToDefaultBranding();
				// Also clear modal selection
				this.modalManager.clearActiveModal();
			}
		});

		// Handle branding reset events
		document.addEventListener('brandingReset', () => {
			this.modalManager.clearActiveModal();
		});

		// Set up launchpad event handlers
		this.launchpad.onLaunchModal((modalDef) => {
			this.createModalFromDefinition(modalDef);
		});

		// Handle Windows/Command key press to toggle launchpad
		let metaKeyPressed = false;
		let metaKeyTimeout: any = null;

		document.addEventListener('keydown', (event: KeyboardEvent) => {
			// Handle F4 key as alternative launchpad trigger
			if (event.key === 'F4') {
				event.preventDefault();
				this.launchpad.toggle();
				return;
			}

			// Track Meta/Windows key press
			if (event.key === 'Meta' || event.key === 'Cmd') {
				if (!metaKeyPressed) {
					metaKeyPressed = true;
					// Set a timeout to detect if Meta key is pressed alone
					metaKeyTimeout = setTimeout(() => {
						if (metaKeyPressed && !this.launchpad.isLaunchpadVisible()) {
							this.launchpad.show();
						}
					}, 200); // 200ms delay to distinguish between Meta key alone vs combinations
				}
			} else if (metaKeyPressed) {
				// If any other key is pressed while Meta is down, cancel the timeout
				clearTimeout(metaKeyTimeout);
			}
		});

		document.addEventListener('keyup', (event: KeyboardEvent) => {
			if (event.key === 'Meta' || event.key === 'Cmd') {
				metaKeyPressed = false;
				clearTimeout(metaKeyTimeout);
			}
		});

		// Alternative: Handle Windows key specifically on Windows
		if (navigator.platform.includes('Win')) {
			document.addEventListener('keydown', (event: KeyboardEvent) => {
				// Windows key codes: Left Windows key = 91, Right Windows key = 92
				if (event.keyCode === 91 || event.keyCode === 92) {
					event.preventDefault();
					setTimeout(() => {
						if (!event.ctrlKey && !event.altKey && !event.shiftKey) {
							this.launchpad.toggle();
						}
					}, 50);
				}
			});
		}
	}

	private handleMenuAction(menu: string, action: string): void {
		switch (action) {
			case 'New Window':
				// Show launchpad to choose which modal to create
				this.launchpad.show();
				break;
			case 'Close Window':
				this.modalManager.closeActiveModal();
				break;
			case 'Minimize All':
				this.modalManager.minimizeAllModals();
				break;
			case 'Restore All':
				this.modalManager.restoreAllModals();
				break;
			case 'Bring All to Front':
				this.modalManager.resetModalZIndexes();
				break;
			case 'Close All':
				this.modalManager.closeAllModals();
				break;
		}
	}

	/**
	 * Get an appropriate icon for a modal based on its title
	 */
	private getModalIcon(title: string): string {
		if (title.toLowerCase().includes('hello')) return '👋';
		if (title.toLowerCase().includes('small')) return '🔹';
		if (title.toLowerCase().includes('large')) return '🔷';
		if (title.toLowerCase().includes('new')) return '✨';
		if (title.toLowerCase().includes('settings')) return '⚙️';
		if (title.toLowerCase().includes('file')) return '📁';
		if (title.toLowerCase().includes('terminal')) return '💻';
		if (title.toLowerCase().includes('calculator')) return '🧮';
		if (title.toLowerCase().includes('text') || title.toLowerCase().includes('editor')) return '📝';
		return '□'; // Default window icon
	}

	/**
	 * Create a modal from a launchpad modal definition
	 */
	private createModalFromDefinition(modalDef: ModalDefinition): void {
		const contentArea = this.mainContainer.querySelector('.custom-ui-content-area') as HTMLElement;
		if (contentArea) {
			// Calculate random position for new modal
			const maxLeft = Math.max(50, window.innerWidth - modalDef.width - 50);
			const maxTop = Math.max(50, window.innerHeight - modalDef.height - 100);
			const left = Math.random() * maxLeft + 50;
			const top = Math.random() * maxTop + 50;

			const modal = this.modalManager.createModal(
				modalDef.title,
				modalDef.width,
				modalDef.height,
				left,
				top,
				modalDef.titleBarColor
			);
			contentArea.appendChild(modal);
		}
	}

	/**
	 * Update layout when window is resized
	 */
	public updateLayout(): void {
		this.mainContainer.style.width = '100%';
		this.mainContainer.style.height = '100%';
	}
}
