/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

/**
 * Manages the custom title bar with drag region and macOS-style menus
 */
export class TitleBarManager {
	private menuActionCallback?: (menu: string, action: string) => void;
	private activeModalTitle = '';
	private modalTabsContainer?: HTMLElement;
	private brandingElement?: HTMLElement;

	/**
	 * Create the title bar with drag region and menus
	 */
	public createTitleBar(): HTMLElement {
		const titleBar = document.createElement('div');
		titleBar.className = 'part titlebar';
		titleBar.style.cssText = 'height: 35px; background: #323233; border-bottom: 1px solid #2e2e30; position: relative; z-index: 1000;';

		const titleBarContainer = document.createElement('div');
		titleBarContainer.className = 'titlebar-container';
		titleBarContainer.style.cssText = 'height: 100%; width: 100%; position: relative;';

		// Create drag region
		const dragRegion = document.createElement('div');
		dragRegion.className = 'titlebar-drag-region';
		dragRegion.style.cssText = 'position: absolute; top: 0; left: 0; width: 100%; height: 100%; -webkit-app-region: drag;';

		// Create branding element (leftmost, changes based on active modal)
		this.brandingElement = document.createElement('div');
		this.brandingElement.style.cssText = 'position: absolute; left: 10px; top: 50%; transform: translateY(-50%); color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; font-size: 14px; font-weight: 700; z-index: 1001; -webkit-app-region: no-drag; cursor: pointer; padding: 4px 8px; border-radius: 4px; transition: background-color 0.1s; background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1);';
		this.brandingElement.textContent = 'Robot Code+';

		// Add hover effect to branding
		this.brandingElement.addEventListener('mouseenter', () => {
			this.brandingElement!.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
		});

		this.brandingElement.addEventListener('mouseleave', () => {
			this.brandingElement!.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
		});

		// Add click handler to branding to reset to default
		this.brandingElement.addEventListener('click', () => {
			this.resetToDefaultBranding();
			// Dispatch a custom event to notify the UI manager
			document.dispatchEvent(new CustomEvent('brandingReset'));
		});

		// Create title bar menu (shifted right to make room for branding)
		const titleBarMenu = document.createElement('div');
		titleBarMenu.style.cssText = 'position: absolute; left: 120px; top: 50%; transform: translateY(-50%); display: flex; gap: 15px; z-index: 1001; -webkit-app-region: no-drag;';

		const fileMenu = this.createTitleBarMenu('File', ['New Window', 'Close Window', 'Minimize All', 'Restore All']);
		const windowMenu = this.createTitleBarMenu('Window', ['Bring All to Front', 'Minimize All', 'Close All']);

		titleBarMenu.appendChild(fileMenu);
		titleBarMenu.appendChild(windowMenu);

		// Create modal tabs container (right side of title bar)
		this.modalTabsContainer = document.createElement('div');
		this.modalTabsContainer.style.cssText = 'position: absolute; right: 10px; top: 50%; transform: translateY(-50%); display: flex; gap: 5px; z-index: 1001; -webkit-app-region: no-drag;';

		titleBarContainer.appendChild(dragRegion);
		titleBarContainer.appendChild(this.brandingElement);
		titleBarContainer.appendChild(titleBarMenu);
		titleBarContainer.appendChild(this.modalTabsContainer);
		titleBar.appendChild(titleBarContainer);

		return titleBar;
	}

	/**
	 * Update the active modal and refresh title bar tabs
	 */
	public updateActiveModal(modalTitle: string): void {
		this.activeModalTitle = modalTitle;

		// Update branding text to show the active modal title
		if (this.brandingElement) {
			this.brandingElement.textContent = modalTitle || 'Robot Code+';
		}

		// Use a slight delay to ensure DOM is updated
		setTimeout(() => this.updateModalTabs(), 10);
	}

	/**
	 * Reset branding to default when no modal is selected (background clicked)
	 */
	public resetToDefaultBranding(): void {
		this.activeModalTitle = '';
		if (this.brandingElement) {
			this.brandingElement.textContent = 'Robot Code+';
		}
		setTimeout(() => this.updateModalTabs(), 10);
	}

	/**
	 * Set callback for menu actions
	 */
	public onMenuAction(callback: (menu: string, action: string) => void): void {
		this.menuActionCallback = callback;
	}

	private updateModalTabs(): void {
		if (!this.modalTabsContainer) return;

		// Clear existing tabs
		while (this.modalTabsContainer.firstChild) {
			this.modalTabsContainer.removeChild(this.modalTabsContainer.firstChild);
		}

		// Get all modals from the content area
		const contentArea = document.querySelector('[style*="calc(100vh - 35px)"]');
		const allModals = contentArea?.querySelectorAll('[data-dialog-title]') as NodeListOf<HTMLElement>;

		if (!allModals || allModals.length === 0) return;

		// Create tabs for each modal
		allModals.forEach(modal => {
			const modalTitle = modal.getAttribute('data-dialog-title') || 'Unknown';
			const isActive = modal.getAttribute('data-active') === 'true' || modalTitle === this.activeModalTitle;

			const tab = this.createModalTab(modalTitle, isActive);
			this.modalTabsContainer!.appendChild(tab);
		});
	}

	private createModalTab(title: string, isActive: boolean): HTMLElement {
		const tab = document.createElement('div');
		tab.style.cssText = `
			padding: 4px 12px;
			background: ${isActive ? '#007acc' : 'rgba(255, 255, 255, 0.1)'};
			color: #cccccc;
			font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
			font-size: 12px;
			border-radius: 4px;
			cursor: pointer;
			transition: background-color 0.1s;
			max-width: 120px;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
		`;

		tab.textContent = title;

		tab.addEventListener('mouseenter', () => {
			if (!isActive) {
				tab.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
			}
		});

		tab.addEventListener('mouseleave', () => {
			if (!isActive) {
				tab.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
			}
		});

		tab.addEventListener('click', () => {
			this.selectModalByTitle(title);
		});

		return tab;
	}

	private selectModalByTitle(title: string): void {
		const contentArea = document.querySelector('[style*="calc(100vh - 35px)"]');
		const targetModal = contentArea?.querySelector(`[data-dialog-title="${title}"]`) as HTMLElement;

		if (targetModal) {
			// Trigger the modal's selection logic
			targetModal.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
		}
	}

	private createTitleBarMenu(title: string, items: string[]): HTMLElement {
		const menuContainer = document.createElement('div');
		menuContainer.style.cssText = 'position: relative; display: inline-block; -webkit-app-region: no-drag;';

		const menuButton = document.createElement('button');
		menuButton.textContent = title;
		menuButton.style.cssText = `
			background: transparent;
			border: none;
			color: #cccccc;
			font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
			font-size: 13px;
			padding: 6px 12px;
			cursor: pointer;
			border-radius: 4px;
			transition: background-color 0.1s;
			-webkit-app-region: no-drag;
			outline: none;
		`;

		const dropdown = document.createElement('div');
		dropdown.style.cssText = `
			position: absolute;
			top: calc(100% + 2px);
			left: 0;
			background: #2d2d30;
			border: 1px solid #3e3e42;
			border-radius: 6px;
			min-width: 160px;
			box-shadow: 0 8px 16px rgba(0, 0, 0, 0.4);
			display: none;
			z-index: 10000;
			-webkit-app-region: no-drag;
		`;

		items.forEach(item => {
			const menuItem = document.createElement('div');
			menuItem.textContent = item;
			menuItem.style.cssText = `
				padding: 10px 16px;
				color: #cccccc;
				font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
				font-size: 13px;
				cursor: pointer;
				transition: background-color 0.15s ease;
				-webkit-app-region: no-drag;
				user-select: none;
			`;

			menuItem.addEventListener('mouseenter', () => {
				menuItem.style.backgroundColor = '#007acc';
			});

			menuItem.addEventListener('mouseleave', () => {
				menuItem.style.backgroundColor = 'transparent';
			});

			menuItem.addEventListener('click', (e) => {
				e.stopPropagation();
				if (this.menuActionCallback) {
					this.menuActionCallback(title, item);
				}
				dropdown.style.display = 'none';
			});

			dropdown.appendChild(menuItem);
		});

		menuButton.addEventListener('mouseenter', () => {
			menuButton.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
		});

		menuButton.addEventListener('mouseleave', () => {
			menuButton.style.backgroundColor = 'transparent';
		});

		menuButton.addEventListener('click', (e) => {
			e.stopPropagation();
			const isVisible = dropdown.style.display === 'block';

			// Close all other dropdowns first
			document.querySelectorAll('[style*="z-index: 10000"]').forEach(el => {
				if (el !== dropdown) {
					(el as HTMLElement).style.display = 'none';
				}
			});

			dropdown.style.display = isVisible ? 'none' : 'block';
		});

		// Close dropdown when clicking outside
		const closeDropdown = (e: Event) => {
			if (!menuContainer.contains(e.target as Node)) {
				dropdown.style.display = 'none';
			}
		};

		document.addEventListener('click', closeDropdown);
		document.addEventListener('mousedown', closeDropdown);

		menuContainer.appendChild(menuButton);
		menuContainer.appendChild(dropdown);

		return menuContainer;
	}
}
