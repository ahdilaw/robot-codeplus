/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Robot Inc. 2025.
 *--------------------------------------------------------------------------------------------*/

import { UI_CONSTANTS, CSS_CLASSES } from './constants.js';
import { DOMUtils, EventUtils } from './utils.js';
import { EventCallback, MenuAction } from './types.js';

/**
 * Manages the custom title bar with drag region and macOS-style menus
 */
export class TitleBarManager {
	private menuActionCallback?: EventCallback<{ menu: string; action: MenuAction }>;
	private modalTabsContainer?: HTMLElement;
	private brandingElement?: HTMLElement;
	private windowControls?: HTMLElement;
	private titleBarElement?: HTMLElement;

	/**
	 * Create the title bar with drag region and menus
	 */
	public createTitleBar(): HTMLElement {
		this.titleBarElement = DOMUtils.createElement(
			'div',
			`part titlebar ${CSS_CLASSES.TITLE_BAR}`,
			`height: ${UI_CONSTANTS.TITLE_BAR_HEIGHT}px; background: ${UI_CONSTANTS.COLORS.TITLE_BAR_BG}; backdrop-filter: blur(20px); border-bottom: 1px solid rgba(0, 0, 0, 0.1); position: relative; z-index: ${UI_CONSTANTS.Z_INDEX.TITLE_BAR}; display: flex; align-items: center; justify-content: center;`
		);

		// Create drag region
		const dragRegion = this.createDragRegion();

		// Create center section with icon, branding, and menu items
		const centerSection = this.createCenterSection();

		// Create window controls
		this.windowControls = this.createWindowControls();

		// Create modal tabs container
		this.modalTabsContainer = this.createModalTabsContainer();

		this.titleBarElement.appendChild(dragRegion);
		this.titleBarElement.appendChild(centerSection);
		this.titleBarElement.appendChild(this.windowControls);
		this.titleBarElement.appendChild(this.modalTabsContainer);

		return this.titleBarElement;
	}

	private createDragRegion(): HTMLElement {
		return DOMUtils.createElement(
			'div',
			'titlebar-drag-region',
			'position: absolute; top: 0; left: 0; width: 100%; height: 100%; -webkit-app-region: drag;'
		);
	}

	private createCenterSection(): HTMLElement {
		const centerSection = DOMUtils.createElement(
			'div',
			undefined,
			'display: flex; align-items: center; gap: 16px; z-index: 1001; -webkit-app-region: no-drag;'
		);

		// App icon
		const appIcon = this.createAppIcon();
		centerSection.appendChild(appIcon);

		// Branding element
		this.brandingElement = this.createBrandingElement();
		centerSection.appendChild(this.brandingElement);

		// Menu items
		const menuItems = this.createMenuItems();
		menuItems.forEach(item => centerSection.appendChild(item));

		return centerSection;
	}

	private createAppIcon(): HTMLElement {
		return DOMUtils.createButton(
			'🤖',
			() => {
				// Dispatch event to let CustomUIManager handle this properly
				document.dispatchEvent(EventUtils.createCustomEvent('minimizeAllModals'));
				this.resetToDefaultBranding();
				document.dispatchEvent(EventUtils.createCustomEvent('brandingReset'));
			},
			'width: 20px; height: 20px; font-size: 16px; display: flex; align-items: center; justify-content: center; border-radius: 4px; background: transparent;',
			{ background: 'rgba(0, 0, 0, 0.1)' }
		);
	}

	private createBrandingElement(): HTMLElement {
		const branding = DOMUtils.createElement(
			'div',
			undefined,
			`color: ${UI_CONSTANTS.COLORS.TEXT_PRIMARY}; font-family: ${UI_CONSTANTS.FONTS.SYSTEM}; font-size: 15px; font-weight: 600; letter-spacing: -0.01em;`
		);
		branding.textContent = 'Robot Code+';
		return branding;
	}

	private createMenuItems(): HTMLElement[] {
		const menuItems = ['File', 'Edit', 'View', 'Window', 'Help'];
		return menuItems.map(item =>
			DOMUtils.createButton(
				item,
				() => this.menuActionCallback?.({ menu: item, action: 'clicked' as MenuAction }),
				`color: ${UI_CONSTANTS.COLORS.TEXT_PRIMARY}; font-family: ${UI_CONSTANTS.FONTS.SYSTEM}; font-size: 14px; font-weight: 400; padding: 4px 8px; border-radius: 4px; background: transparent;`,
				{ background: 'rgba(0, 0, 0, 0.06)' }
			)
		);
	}

	private createWindowControls(): HTMLElement {
		const controls = DOMUtils.createElement(
			'div',
			undefined,
			'position: absolute; right: 16px; top: 50%; transform: translateY(-50%); display: none; align-items: center; gap: 8px; z-index: 1001; -webkit-app-region: no-drag;'
		);

		const minimizeBtn = this.createWindowControl('🗕', '#ffbd2e', () => {
			console.log('Minimize clicked');
		});

		const closeBtn = this.createWindowControl('✕', '#ff5f57', () => {
			console.log('Close clicked');
		});

		controls.appendChild(minimizeBtn);
		controls.appendChild(closeBtn);

		return controls;
	}

	private createModalTabsContainer(): HTMLElement {
		return DOMUtils.createElement(
			'div',
			undefined,
			'position: absolute; right: 16px; top: 50%; transform: translateY(-50%); display: flex; gap: 4px; z-index: 1001; -webkit-app-region: no-drag;'
		);
	}

	/**
	 * Update the active modal and refresh title bar tabs
	 */
	public updateActiveModal(modalTitle: string): void {
		// Update branding text to show the active modal title
		if (this.brandingElement) {
			this.brandingElement.textContent = modalTitle || 'Robot Code+';
		}
	}

	/**
	 * Reset branding to default when no modal is selected (background clicked)
	 */
	public resetToDefaultBranding(): void {
		if (this.brandingElement) {
			this.brandingElement.textContent = 'Robot Code+';
		}
	}

	/**
	 * Set callback for menu actions
	 */
	public onMenuAction(callback: (menu: string, action: string) => void): void {
		this.menuActionCallback = (data) => callback(data.menu, data.action);
	}

	/**
	 * Set the maximized state and update title bar accordingly
	 */
	public setMaximizedState(maximized: boolean): void {
		// Update window controls and modal tabs display based on maximized state
		if (this.windowControls && this.modalTabsContainer) {
			if (maximized) {
				this.windowControls.style.display = 'flex';
				this.modalTabsContainer.style.display = 'none';
			} else {
				this.windowControls.style.display = 'none';
				this.modalTabsContainer.style.display = 'flex';
			}
		}
	}

	/**
	 * Create a window control button (minimize/close)
	 */
	private createWindowControl(symbol: string, color: string, onClick: () => void): HTMLElement {
		const button = DOMUtils.createElement(
			'div',
			undefined,
			`
				width: 12px;
				height: 12px;
				border-radius: 50%;
				background: ${color};
				display: flex;
				align-items: center;
				justify-content: center;
				cursor: pointer;
				font-size: 8px;
				color: transparent;
				transition: color ${UI_CONSTANTS.ANIMATION.FAST}ms;
			`
		);

		button.textContent = symbol;

		button.addEventListener('mouseenter', () => {
			button.style.color = 'rgba(0, 0, 0, 0.6)';
		});

		button.addEventListener('mouseleave', () => {
			button.style.color = 'transparent';
		});

		button.addEventListener('click', (e) => {
			e.stopPropagation();
			onClick();
		});

		return button;
	}

	/**
	 * Restore a minimized modal from dock
	 */
	public restoreModalFromDock(modalTitle: string): void {
		const targetModal = DOMUtils.getModalByTitle(modalTitle);

		if (targetModal && targetModal.style.display === 'none') {
			// Show and animate modal
			targetModal.style.display = 'block';
			targetModal.style.transform = 'scale(0.1) translateY(50vh)';
			targetModal.style.opacity = '0';

			// Animate to normal state
			DOMUtils.animate(
				targetModal,
				{
					transform: 'scale(1) translateY(0)',
					opacity: '1'
				},
				UI_CONSTANTS.ANIMATION.MODAL_MINIMIZE
			).then(() => {
				targetModal.style.transform = '';
				targetModal.style.opacity = '';
				targetModal.setAttribute('data-active', 'true');
				this.updateActiveModal(modalTitle);
			});

			// Dispatch event
			targetModal.dispatchEvent(EventUtils.createCustomEvent('modalRestored', {
				modalTitle
			}));
		}
	}
}
