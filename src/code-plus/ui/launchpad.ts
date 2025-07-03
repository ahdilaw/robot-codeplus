/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

/**
 * Represents a modal definition for the launchpad
 */
export interface ModalDefinition {
	title: string;
	width: number;
	height: number;
	titleBarColor: string;
	icon: string;
}

/**
 * Manages the macOS-style launchpad overlay with search functionality
 */
export class Launchpad {
	private launchpadElement: HTMLElement;
	private searchInput: HTMLInputElement;
	private iconsContainer: HTMLElement;
	private isVisible = false;
	private modalDefinitions: ModalDefinition[] = [];
	private filteredModals: ModalDefinition[] = [];
	private launchModalCallback?: (modalDef: ModalDefinition) => void;

	constructor() {
		this.launchpadElement = this.createLaunchpadElement();
		this.searchInput = this.launchpadElement.querySelector('.launchpad-search') as HTMLInputElement;
		this.iconsContainer = this.launchpadElement.querySelector('.launchpad-icons') as HTMLElement;
		this.setupEventHandlers();
		this.initializeModalDefinitions();
	}

	/**
	 * Get the launchpad DOM element
	 */
	public getElement(): HTMLElement {
		return this.launchpadElement;
	}

	/**
	 * Toggle the launchpad visibility
	 */
	public toggle(): void {
		if (this.isVisible) {
			this.hide();
		} else {
			this.show();
		}
	}

	/**
	 * Show the launchpad overlay
	 */
	public show(): void {
		this.isVisible = true;
		this.launchpadElement.style.display = 'flex';
		this.launchpadElement.style.opacity = '0';
		this.launchpadElement.style.transform = 'scale(0.8)';

		// Animate in
		requestAnimationFrame(() => {
			this.launchpadElement.style.transition = 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
			this.launchpadElement.style.opacity = '1';
			this.launchpadElement.style.transform = 'scale(1)';
		});

		// Focus the search input
		setTimeout(() => {
			this.searchInput.focus();
		}, 100);

		// Update the icons
		this.updateIcons();
	}

	/**
	 * Hide the launchpad overlay
	 */
	public hide(): void {
		this.isVisible = false;
		this.launchpadElement.style.transition = 'all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
		this.launchpadElement.style.opacity = '0';
		this.launchpadElement.style.transform = 'scale(0.8)';

		setTimeout(() => {
			this.launchpadElement.style.display = 'none';
			this.searchInput.value = '';
			this.filteredModals = [...this.modalDefinitions];
			this.updateIcons();
		}, 200);
	}

	/**
	 * Set callback for launching modals
	 */
	public onLaunchModal(callback: (modalDef: ModalDefinition) => void): void {
		this.launchModalCallback = callback;
	}

	/**
	 * Check if launchpad is currently visible
	 */
	public isLaunchpadVisible(): boolean {
		return this.isVisible;
	}

	private createLaunchpadElement(): HTMLElement {
		const launchpad = document.createElement('div');
		launchpad.className = 'launchpad-overlay';
		launchpad.style.cssText = `
			position: fixed;
			top: 0;
			left: 0;
			width: 100%;
			height: 100%;
			background: rgba(0, 0, 0, 0.8);
			backdrop-filter: blur(20px);
			display: none;
			flex-direction: column;
			align-items: center;
			justify-content: flex-start;
			z-index: 10000;
			padding: 80px 40px 40px 40px;
		`;

		// Create search bar
		const searchContainer = this.createSearchContainer();
		launchpad.appendChild(searchContainer);

		// Create icons container
		const iconsContainer = this.createIconsContainer();
		launchpad.appendChild(iconsContainer);

		return launchpad;
	}

	private createSearchContainer(): HTMLElement {
		const searchContainer = document.createElement('div');
		searchContainer.className = 'launchpad-search-container';
		searchContainer.style.cssText = `
			width: 100%;
			max-width: 600px;
			margin-bottom: 40px;
		`;

		const searchInput = document.createElement('input');
		searchInput.type = 'text';
		searchInput.placeholder = 'Search modals...';
		searchInput.className = 'launchpad-search';
		searchInput.style.cssText = `
			width: 100%;
			height: 50px;
			background: rgba(255, 255, 255, 0.1);
			border: 2px solid rgba(255, 255, 255, 0.2);
			border-radius: 25px;
			padding: 0 20px;
			font-size: 18px;
			color: white;
			outline: none;
			transition: all 0.3s ease;
			font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
		`;

		// Add focus styles
		searchInput.addEventListener('focus', () => {
			searchInput.style.borderColor = '#007acc';
			searchInput.style.boxShadow = '0 0 0 3px rgba(0, 122, 204, 0.3)';
		});

		searchInput.addEventListener('blur', () => {
			searchInput.style.borderColor = 'rgba(255, 255, 255, 0.2)';
			searchInput.style.boxShadow = 'none';
		});

		// Placeholder styling
		const style = document.createElement('style');
		style.textContent = `
			.launchpad-search::placeholder {
				color: rgba(255, 255, 255, 0.6);
			}
		`;
		document.head.appendChild(style);

		searchContainer.appendChild(searchInput);
		return searchContainer;
	}

	private createIconsContainer(): HTMLElement {
		const iconsContainer = document.createElement('div');
		iconsContainer.className = 'launchpad-icons';
		iconsContainer.style.cssText = `
			display: grid;
			grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
			gap: 30px;
			width: 100%;
			max-width: 1000px;
			max-height: calc(100vh - 200px);
			overflow-y: auto;
			padding: 20px;
		`;

		return iconsContainer;
	}

	private setupEventHandlers(): void {
		// Search functionality
		this.searchInput.addEventListener('input', () => {
			this.filterModals();
		});

		// Close on background click
		this.launchpadElement.addEventListener('click', (event: MouseEvent) => {
			if (event.target === this.launchpadElement) {
				this.hide();
			}
		});

		// Close on Escape key
		document.addEventListener('keydown', (event: KeyboardEvent) => {
			if (this.isVisible && event.key === 'Escape') {
				this.hide();
			}
		});
	}

	private initializeModalDefinitions(): void {
		this.modalDefinitions = [
			{
				title: 'HELLO Dialog',
				width: 600,
				height: 400,
				titleBarColor: '#007acc',
				icon: '👋'
			},
			{
				title: 'Small Window',
				width: 400,
				height: 300,
				titleBarColor: '#8e44ad',
				icon: '📱'
			},
			{
				title: 'Large Window',
				width: 800,
				height: 600,
				titleBarColor: '#e67e22',
				icon: '🖥️'
			},
			{
				title: 'Settings',
				width: 500,
				height: 400,
				titleBarColor: '#95a5a6',
				icon: '⚙️'
			},
			{
				title: 'File Manager',
				width: 700,
				height: 500,
				titleBarColor: '#3498db',
				icon: '📁'
			},
			{
				title: 'Terminal',
				width: 600,
				height: 400,
				titleBarColor: '#2c3e50',
				icon: '💻'
			},
			{
				title: 'Calculator',
				width: 300,
				height: 400,
				titleBarColor: '#e74c3c',
				icon: '🧮'
			},
			{
				title: 'Text Editor',
				width: 650,
				height: 450,
				titleBarColor: '#27ae60',
				icon: '📝'
			}
		];

		this.filteredModals = [...this.modalDefinitions];
	}

	private filterModals(): void {
		const searchTerm = this.searchInput.value.toLowerCase().trim();

		if (searchTerm === '') {
			this.filteredModals = [...this.modalDefinitions];
		} else {
			this.filteredModals = this.modalDefinitions.filter(modal =>
				modal.title.toLowerCase().includes(searchTerm)
			);
		}

		this.updateIcons();
	}

	private updateIcons(): void {
		// Clear existing icons using DOM methods instead of innerHTML
		while (this.iconsContainer.firstChild) {
			this.iconsContainer.removeChild(this.iconsContainer.firstChild);
		}

		// Create icons for filtered modals
		this.filteredModals.forEach(modal => {
			const iconElement = this.createIconElement(modal);
			this.iconsContainer.appendChild(iconElement);
		});

		// Add animation
		const icons = this.iconsContainer.querySelectorAll('.launchpad-icon');
		icons.forEach((icon, index) => {
			const element = icon as HTMLElement;
			element.style.opacity = '0';
			element.style.transform = 'scale(0.8) translateY(20px)';

			setTimeout(() => {
				element.style.transition = 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
				element.style.opacity = '1';
				element.style.transform = 'scale(1) translateY(0)';
			}, index * 50);
		});
	}

	private createIconElement(modal: ModalDefinition): HTMLElement {
		const iconContainer = document.createElement('div');
		iconContainer.className = 'launchpad-icon';
		iconContainer.style.cssText = `
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			cursor: pointer;
			padding: 20px;
			border-radius: 20px;
			transition: all 0.2s ease;
			user-select: none;
		`;

		// Icon circle
		const iconCircle = document.createElement('div');
		iconCircle.style.cssText = `
			width: 80px;
			height: 80px;
			background: ${modal.titleBarColor};
			border-radius: 20px;
			display: flex;
			align-items: center;
			justify-content: center;
			font-size: 36px;
			margin-bottom: 12px;
			box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
			transition: all 0.2s ease;
			color: white;
			text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
			font-family: "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif;
		`;
		iconCircle.textContent = modal.icon;

		// Label
		const label = document.createElement('div');
		label.style.cssText = `
			color: white;
			font-size: 14px;
			font-weight: 500;
			text-align: center;
			font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
			max-width: 100px;
			word-wrap: break-word;
		`;
		label.textContent = modal.title;

		// Hover effects
		iconContainer.addEventListener('mouseenter', () => {
			iconContainer.style.transform = 'scale(1.05)';
			iconCircle.style.transform = 'scale(1.1)';
			iconCircle.style.boxShadow = '0 8px 30px rgba(0, 0, 0, 0.4)';
		});

		iconContainer.addEventListener('mouseleave', () => {
			iconContainer.style.transform = 'scale(1)';
			iconCircle.style.transform = 'scale(1)';
			iconCircle.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.3)';
		});

		// Click handler
		iconContainer.addEventListener('click', () => {
			if (this.launchModalCallback) {
				this.launchModalCallback(modal);
			}
			this.hide();
		});

		iconContainer.appendChild(iconCircle);
		iconContainer.appendChild(label);

		return iconContainer;
	}
}
