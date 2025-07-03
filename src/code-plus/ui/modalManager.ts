/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { ModalWindow } from './modalWindow.js';

/**
 * Manages multiple modal dialog windows with proper z-index handling
 */
export class ModalManager {
	private modals: Map<string, ModalWindow> = new Map();
	private modalSelectionCallback?: (modalTitle: string) => void;
	private nextZIndex = 1000;
	private activeModal?: ModalWindow;
	private minimizeCallback?: (title: string) => void;
	private restoreFromDockCallback?: (title: string) => void;
	private closeCallback?: (title: string) => void;

	/**
	 * Create a new modal dialog
	 */
	public createModal(title: string, width: number, height: number, left: number, top: number, titleBarColor: string): HTMLElement {
		const modalWindow = new ModalWindow(title, width, height, left, top, titleBarColor);
		const modalElement = modalWindow.createElement();

		// Set up event handlers for this modal
		modalElement.addEventListener('mousedown', () => this.bringModalToFront(modalWindow));

		// Handle close events
		modalElement.addEventListener('modalClose', () => this.closeModal(modalWindow));

		// Set up minimize/restore callbacks
		modalWindow.onMinimize((modalTitle: string) => {
			if (this.minimizeCallback) {
				this.minimizeCallback(modalTitle);
			}
		});

		modalWindow.onRestore((modalTitle: string) => {
			if (this.restoreFromDockCallback) {
				this.restoreFromDockCallback(modalTitle);
			}
		});

		// Store the modal reference
		this.modals.set(title, modalWindow);

		// Make this the active modal
		this.bringModalToFront(modalWindow);

		return modalElement;
	}

	/**
	 * Bring a modal to the front and make it active
	 */
	public bringModalToFront(modal: ModalWindow): void {
		// Update z-indexes: active modal gets highest, others stay above background (base z-index: 100)
		// Background has z-index: 1, modals start at 100
		this.nextZIndex = Math.max(this.nextZIndex + 1, 100);
		modal.setZIndex(this.nextZIndex);

		// Update active state - reset all other modals to non-active state
		this.modals.forEach(m => {
			if (m !== modal) {
				m.setOpacity(0.9);
				m.setActive(false);
			}
		});

		// Set this modal as active
		this.activeModal = modal;
		modal.setOpacity(1);
		modal.setActive(true);

		// Notify title bar of selection change
		if (this.modalSelectionCallback) {
			this.modalSelectionCallback(modal.getTitle());
		}
	}

	/**
	 * Close the currently active modal
	 */
	public closeActiveModal(): void {
		if (this.activeModal) {
			this.closeModal(this.activeModal);
		}
	}

	/**
	 * Close a specific modal
	 */
	public closeModal(modal: ModalWindow): void {
		const element = modal.getElement();

		// Animate out and remove
		element.style.transform = 'scale(0.8)';
		element.style.opacity = '0';
		element.style.transition = 'all 0.2s ease-out';

		setTimeout(() => {
			if (element.parentNode) {
				element.parentNode.removeChild(element);
			}
			this.modals.delete(modal.getTitle());

			// If this was the active modal, find another one to activate
			if (this.activeModal === modal) {
				this.activeModal = undefined;
				const remainingModals = Array.from(this.modals.values());
				if (remainingModals.length > 0) {
					this.bringModalToFront(remainingModals[remainingModals.length - 1]);
				}
			}

			// Trigger close callback if set
			if (this.closeCallback) {
				this.closeCallback(modal.getTitle());
			}
		}, 200);
	}

	/**
	 * Minimize all modals
	 */
	public minimizeAllModals(): void {
		this.modals.forEach(modal => modal.minimize());
	}

	/**
	 * Restore all minimized modals
	 */
	public restoreAllModals(): void {
		this.modals.forEach(modal => modal.restore());
	}

	/**
	 * Close all modals
	 */
	public closeAllModals(): void {
		// Create a copy of the array to avoid modification during iteration
		const modalsToClose = Array.from(this.modals.values());
		modalsToClose.forEach(modal => this.closeModal(modal));
	}

	/**
	 * Reset all modal z-indexes to a base level
	 */
	public resetModalZIndexes(): void {
		let zIndex = 1000;
		this.modals.forEach(modal => {
			modal.setZIndex(zIndex);
			zIndex += 1;
		});
		this.nextZIndex = zIndex;
	}

	/**
	 * Set callback for modal selection events
	 */
	public onModalSelected(callback: (modalTitle: string) => void): void {
		this.modalSelectionCallback = callback;
	}

	/**
	 * Set callback for modal minimization events
	 */
	public onModalMinimized(callback: (title: string) => void): void {
		this.minimizeCallback = callback;
	}

	/**
	 * Set callback for modal restoration from dock events
	 */
	public onModalRestoredFromDock(callback: (title: string) => void): void {
		this.restoreFromDockCallback = callback;
	}

	/**
	 * Set callback for modal close events
	 */
	public onModalClosed(callback: (title: string) => void): void {
		this.closeCallback = callback;
	}

	/**
	 * Restore a modal by title (called from dock)
	 */
	public restoreModalByTitle(title: string): void {
		const modal = this.modals.get(title);
		if (modal && modal.isModalMinimized()) {
			modal.restore();
			this.bringModalToFront(modal);

			if (this.restoreFromDockCallback) {
				this.restoreFromDockCallback(title);
			}
		}
	}

	/**
	 * Get the currently active modal
	 */
	public getActiveModal(): ModalWindow | undefined {
		return this.activeModal;
	}

	/**
	 * Get all modals
	 */
	public getAllModals(): ModalWindow[] {
		return Array.from(this.modals.values());
	}

	/**
	 * Clear active modal selection (for background clicks)
	 */
	public clearActiveModal(): void {
		// Reset all modals to non-active state
		this.modals.forEach(modal => {
			modal.setOpacity(0.8);
			modal.setActive(false);
		});

		this.activeModal = undefined;

		// Notify title bar of selection change (empty string = background selected)
		if (this.modalSelectionCallback) {
			this.modalSelectionCallback('');
		}
	}
}
