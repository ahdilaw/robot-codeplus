/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

/**
 * Manages the macOS-style dock at the bottom of the screen
 */
export class Dock {
	private dockElement: HTMLElement;
	private dockContainer: HTMLElement;
	private minimizedModals: Map<string, { title: string; icon: string }> = new Map();
	private createModalCallback?: () => void;
	private restoreModalCallback?: (title: string) => void;

	constructor() {
		this.dockElement = this.createDockElement();
		this.dockContainer = this.dockElement.querySelector('.dock-container') as HTMLElement;
		// Ensure dock is visible on creation
		this.updateVisibility();
	}

	/**
	 * Get the dock DOM element
	 */
	public getElement(): HTMLElement {
		return this.dockElement;
	}

	/**
	 * Add a minimized modal to the dock
	 */
	public addMinimizedModal(title: string, icon: string = '□'): void {
		this.minimizedModals.set(title, { title, icon });
		this.updateDockItems();
	}

	/**
	 * Remove a modal from the dock
	 */
	public removeModal(title: string): void {
		this.minimizedModals.delete(title);
		this.updateDockItems();
	}

	/**
	 * Set callback for creating new modals
	 */
	public onCreateModal(callback: () => void): void {
		this.createModalCallback = callback;
	}

	/**
	 * Set callback for restoring modals
	 */
	public onRestoreModal(callback: (title: string) => void): void {
		this.restoreModalCallback = callback;
	}

	/**
	 * Update the dock to show/hide based on content
	 */
	public updateVisibility(): void {
		// Always show the dock since it contains the "+" button to create new modals
		this.dockElement.style.display = 'flex';
	}

	private createDockElement(): HTMLElement {
		const dock = document.createElement('div');
		dock.className = 'dock';
		dock.style.cssText = `
			position: fixed;
			bottom: 20px;
			left: 50%;
			transform: translateX(-50%);
			background: rgba(255, 255, 255, 0.1);
			backdrop-filter: blur(10px);
			border: 1px solid rgba(255, 255, 255, 0.2);
			border-radius: 16px;
			padding: 8px 12px;
			display: flex;
			align-items: center;
			gap: 8px;
			z-index: 9999;
			box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
			transition: all 0.3s ease;
		`;

		const dockContainer = document.createElement('div');
		dockContainer.className = 'dock-container';
		dockContainer.style.cssText = `
			display: flex;
			align-items: center;
			gap: 8px;
		`;

		// Add the "+" icon for creating new modals
		const addButton = this.createDockItem('+', 'Create New Modal', () => {
			if (this.createModalCallback) {
				this.createModalCallback();
			}
		});
		addButton.style.background = 'rgba(0, 122, 204, 0.8)';
		dockContainer.appendChild(addButton);

		// Add separator
		const separator = document.createElement('div');
		separator.style.cssText = `
			width: 1px;
			height: 32px;
			background: rgba(255, 255, 255, 0.3);
			margin: 0 4px;
		`;
		dockContainer.appendChild(separator);

		dock.appendChild(dockContainer);
		return dock;
	}

	private createDockItem(icon: string, tooltip: string, onClick: () => void): HTMLElement {
		const item = document.createElement('div');
		item.className = 'dock-item';
		item.style.cssText = `
			width: 48px;
			height: 48px;
			background: rgba(255, 255, 255, 0.15);
			border: 1px solid rgba(255, 255, 255, 0.2);
			border-radius: 12px;
			display: flex;
			align-items: center;
			justify-content: center;
			cursor: pointer;
			transition: all 0.2s ease;
			font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
			font-size: 18px;
			font-weight: bold;
			color: white;
			user-select: none;
			position: relative;
		`;

		item.textContent = icon;
		item.title = tooltip;

		// Add hover effects
		item.addEventListener('mouseenter', () => {
			item.style.transform = 'scale(1.1) translateY(-4px)';
			item.style.background = 'rgba(255, 255, 255, 0.25)';
			item.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.3)';
		});

		item.addEventListener('mouseleave', () => {
			item.style.transform = 'scale(1) translateY(0)';
			item.style.background = 'rgba(255, 255, 255, 0.15)';
			item.style.boxShadow = 'none';
		});

		item.addEventListener('click', () => {
			// Add click animation
			item.style.transform = 'scale(0.95) translateY(0)';
			setTimeout(() => {
				item.style.transform = 'scale(1) translateY(0)';
			}, 100);
			onClick();
		});

		return item;
	}

	private updateDockItems(): void {
		// Clear existing modal items (keep the add button and separator)
		const existingItems = this.dockContainer.querySelectorAll('.dock-item:not(:first-child)');
		existingItems.forEach(item => {
			if (item.parentNode) {
				item.parentNode.removeChild(item);
			}
		});

		// Add items for minimized modals
		this.minimizedModals.forEach((modal, title) => {
			const item = this.createDockItem(modal.icon, modal.title, () => {
				if (this.restoreModalCallback) {
					this.restoreModalCallback(title);
				}
			});
			this.dockContainer.appendChild(item);
		});

		// Update visibility
		this.updateVisibility();
	}
}
