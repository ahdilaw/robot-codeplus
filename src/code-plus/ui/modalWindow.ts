/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Robot Inc. 2025.
 *--------------------------------------------------------------------------------------------*/

import { UI_CONSTANTS } from './constants.js';
import { EventUtils } from './utils.js';
import { EventCallback, ModalState } from './types.js';

/**
 * Represents an individual modal dialog window with drag, resize, and window controls
 */
export class ModalWindow {
	private element: HTMLElement;
	private title: string;
	private state: ModalState = {
		isMinimized: false,
		isMaximized: false,
		isActive: false,
		zIndex: UI_CONSTANTS.Z_INDEX.MODAL_BASE
	};
	private minimizeCallback?: EventCallback<string>;
	private restoreCallback?: EventCallback<string>;

	constructor(
		title: string,
		private width: number,
		private height: number,
		private left: number,
		private top: number,
		private titleBarColor: string
	) {
		this.title = title;
		this.element = this.createModalElement();
	}

	/**
	 * Get the DOM element for this modal
	 */
	public getElement(): HTMLElement {
		return this.element;
	}

	/**
	 * Get the title of this modal
	 */
	public getTitle(): string {
		return this.title;
	}

	/**
	 * Create and return the modal DOM element
	 */
	public createElement(): HTMLElement {
		return this.element;
	}

	/**
	 * Set the z-index of this modal
	 */
	public setZIndex(zIndex: number): void {
		this.element.style.zIndex = zIndex.toString();
	}

	/**
	 * Set the opacity of this modal
	 */
	public setOpacity(opacity: number): void {
		this.element.style.opacity = opacity.toString();
	}

	/**
	 * Set the active state of this modal
	 */
	public setActive(isActive: boolean): void {
		this.element.setAttribute('data-active', isActive.toString());
	}

	/**
	 * Get the minimized state of this modal
	 */
	public isModalMinimized(): boolean {
		return this.state.isMinimized;
	}

	/**
	 * Set callback for minimize events
	 */
	public onMinimize(callback: EventCallback<string>): void {
		this.minimizeCallback = callback;
	}

	/**
	 * Set callback for restore events
	 */
	public onRestore(callback: EventCallback<string>): void {
		this.restoreCallback = callback;
	}

	/**
	 * Minimize this modal
	 */
	public minimize(): void {
		this.element.style.display = 'none';
		this.state.isMinimized = true;

		// Notify dock of minimization
		if (this.minimizeCallback) {
			this.minimizeCallback(this.title);
		}
	}

	/**
	 * Restore this modal from minimized state
	 */
	public restore(): void {
		if (this.state.isMinimized) {
			this.element.style.display = 'flex';
			this.state.isMinimized = false;

			// Notify dock of restoration
			if (this.restoreCallback) {
				this.restoreCallback(this.title);
			}
		}
	}

	/**
	 * Toggle maximize state of this modal
	 */
	public toggleMaximize(): void {
		if (this.state.isMaximized) {
			this.restoreSize();
		} else {
			this.maximize();
		}
	}

	private createModalElement(): HTMLElement {
		const dialog = document.createElement('div');
		dialog.style.cssText = `
			position: absolute;
			width: ${this.width}px;
			height: ${this.height}px;
			left: ${this.left}px;
			top: ${this.top}px;
			background: #2d2d30;
			border: 1px solid #3e3e42;
			border-radius: 8px;
			box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
			display: flex;
			flex-direction: column;
			min-width: 300px;
			min-height: 200px;
			z-index: 100;
		`;

		// Set dialog title as data attribute for reference
		dialog.setAttribute('data-dialog-title', this.title);

		// Create title bar for the dialog
		const dialogTitleBar = this.createTitleBar();

		// Dialog content area
		const dialogContent = this.createContentArea();

		// Add resize handles
		const resizeHandles = this.createResizeHandles(dialog);

		dialog.appendChild(dialogTitleBar);
		dialog.appendChild(dialogContent);
		resizeHandles.forEach(handle => dialog.appendChild(handle));

		// Make dialog draggable
		this.makeDraggable(dialog, dialogTitleBar);

		return dialog;
	}

	private createTitleBar(): HTMLElement {
		const dialogTitleBar = document.createElement('div');
		dialogTitleBar.style.cssText = `
			height: 32px;
			background: ${this.titleBarColor};
			display: flex;
			align-items: center;
			justify-content: space-between;
			padding: 0 8px;
			cursor: move;
			user-select: none;
			border-radius: 8px 8px 0 0;
		`;

		// Dialog title
		const dialogTitle = document.createElement('span');
		dialogTitle.textContent = this.title;
		dialogTitle.style.cssText = 'color: white; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; font-size: 14px; font-weight: 500;';

		// Window controls container
		const windowControls = document.createElement('div');
		windowControls.style.cssText = 'display: flex; gap: 4px;';

		// Create window control buttons
		const minimizeBtn = this.createWindowControlButton('−', '#cccccc', () => this.minimize());
		const maximizeBtn = this.createWindowControlButton('□', '#cccccc', () => this.toggleMaximize());
		const closeBtn = this.createWindowControlButton('×', '#e81123', () => this.closeModal());

		windowControls.appendChild(minimizeBtn);
		windowControls.appendChild(maximizeBtn);
		windowControls.appendChild(closeBtn);

		dialogTitleBar.appendChild(dialogTitle);
		dialogTitleBar.appendChild(windowControls);

		return dialogTitleBar;
	}

	private createContentArea(): HTMLElement {
		const dialogContent = document.createElement('div');
		dialogContent.style.cssText = `
			flex: 1;
			padding: 20px;
			background: #252526;
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			border-radius: 0 0 8px 8px;
		`;

		const helloElement = document.createElement('h1');
		helloElement.textContent = this.title.split(' ')[0]; // Use first word of title
		helloElement.style.cssText = 'color: #cccccc; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; font-size: 48px; margin: 0;';

		const subText = document.createElement('p');
		subText.textContent = `This is a ${this.width}x${this.height} resizable dialog window!`;
		subText.style.cssText = 'color: #cccccc; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; font-size: 16px; margin: 10px 0 0 0; text-align: center;';

		dialogContent.appendChild(helloElement);
		dialogContent.appendChild(subText);

		return dialogContent;
	}

	private createWindowControlButton(symbol: string, color: string, onClick: () => void): HTMLElement {
		const button = document.createElement('button');
		button.textContent = symbol;
		button.style.cssText = `
			width: 24px;
			height: 24px;
			border: none;
			background: transparent;
			color: ${color};
			font-family: monospace;
			font-size: 16px;
			font-weight: bold;
			cursor: pointer;
			display: flex;
			align-items: center;
			justify-content: center;
			border-radius: 4px;
			transition: background-color 0.1s;
		`;

		button.addEventListener('mouseenter', () => {
			button.style.backgroundColor = symbol === '×' ? '#e81123' : 'rgba(255, 255, 255, 0.1)';
		});

		button.addEventListener('mouseleave', () => {
			button.style.backgroundColor = 'transparent';
		});

		button.addEventListener('click', onClick);

		return button;
	}

	private createResizeHandles(dialog: HTMLElement): HTMLElement[] {
		const handles: HTMLElement[] = [];
		const positions = [
			{ name: 'nw', cursor: 'nw-resize', top: '-4px', left: '-4px', width: '8px', height: '8px' },
			{ name: 'n', cursor: 'n-resize', top: '-4px', left: '50%', width: '8px', height: '8px', transform: 'translateX(-50%)' },
			{ name: 'ne', cursor: 'ne-resize', top: '-4px', right: '-4px', width: '8px', height: '8px' },
			{ name: 'e', cursor: 'e-resize', top: '50%', right: '-4px', width: '8px', height: '8px', transform: 'translateY(-50%)' },
			{ name: 'se', cursor: 'se-resize', bottom: '-4px', right: '-4px', width: '8px', height: '8px' },
			{ name: 's', cursor: 's-resize', bottom: '-4px', left: '50%', width: '8px', height: '8px', transform: 'translateX(-50%)' },
			{ name: 'sw', cursor: 'sw-resize', bottom: '-4px', left: '-4px', width: '8px', height: '8px' },
			{ name: 'w', cursor: 'w-resize', top: '50%', left: '-4px', width: '8px', height: '8px', transform: 'translateY(-50%)' }
		];

		positions.forEach(pos => {
			const handle = document.createElement('div');
			handle.style.cssText = `
				position: absolute;
				background: transparent;
				cursor: ${pos.cursor};
				${pos.top ? `top: ${pos.top};` : ''}
				${pos.bottom ? `bottom: ${pos.bottom};` : ''}
				${pos.left ? `left: ${pos.left};` : ''}
				${pos.right ? `right: ${pos.right};` : ''}
				width: ${pos.width};
				height: ${pos.height};
				${pos.transform ? `transform: ${pos.transform};` : ''}
				z-index: 1001;
			`;

			handle.addEventListener('mousedown', (e) => this.startResize(e, dialog, pos.name));
			handles.push(handle);
		});

		return handles;
	}

	private makeDraggable(dialog: HTMLElement, handle: HTMLElement): void {
		let isDragging = false;
		let startX = 0;
		let startY = 0;
		let startLeft = 0;
		let startTop = 0;

		handle.addEventListener('mousedown', (e) => {
			if ((e.target as HTMLElement).tagName === 'BUTTON') return; // Don't drag when clicking buttons

			isDragging = true;
			startX = e.clientX;
			startY = e.clientY;

			const rect = dialog.getBoundingClientRect();
			startLeft = rect.left;
			startTop = rect.top;

			document.addEventListener('mousemove', onMouseMove);
			document.addEventListener('mouseup', onMouseUp);

			e.preventDefault();
		});

		const onMouseMove = (e: MouseEvent) => {
			if (!isDragging) return;

			const deltaX = e.clientX - startX;
			const deltaY = e.clientY - startY;

			dialog.style.left = `${startLeft + deltaX}px`;
			dialog.style.top = `${startTop + deltaY}px`;
		};

		const onMouseUp = () => {
			isDragging = false;
			document.removeEventListener('mousemove', onMouseMove);
			document.removeEventListener('mouseup', onMouseUp);
		};
	}

	private startResize(e: MouseEvent, dialog: HTMLElement, direction: string): void {
		e.preventDefault();
		e.stopPropagation();

		const startX = e.clientX;
		const startY = e.clientY;
		const rect = dialog.getBoundingClientRect();
		const startWidth = rect.width;
		const startHeight = rect.height;
		const startLeft = rect.left;
		const startTop = rect.top;

		const onMouseMove = (e: MouseEvent) => {
			const deltaX = e.clientX - startX;
			const deltaY = e.clientY - startY;

			let newWidth = startWidth;
			let newHeight = startHeight;
			let newLeft = startLeft;
			let newTop = startTop;

			// Handle horizontal resizing
			if (direction.includes('e')) {
				newWidth = Math.max(300, startWidth + deltaX);
			} else if (direction.includes('w')) {
				newWidth = Math.max(300, startWidth - deltaX);
				newLeft = startLeft + (startWidth - newWidth);
			}

			// Handle vertical resizing
			if (direction.includes('s')) {
				newHeight = Math.max(200, startHeight + deltaY);
			} else if (direction.includes('n')) {
				newHeight = Math.max(200, startHeight - deltaY);
				newTop = startTop + (startHeight - newHeight);
			}

			dialog.style.width = `${newWidth}px`;
			dialog.style.height = `${newHeight}px`;
			dialog.style.left = `${newLeft}px`;
			dialog.style.top = `${newTop}px`;
		};

		const onMouseUp = () => {
			document.removeEventListener('mousemove', onMouseMove);
			document.removeEventListener('mouseup', onMouseUp);
		};

		document.addEventListener('mousemove', onMouseMove);
		document.addEventListener('mouseup', onMouseUp);
	}

	private maximize(): void {
		if (!this.state.isMaximized) {
			// Store original size
			const rect = this.element.getBoundingClientRect();
			this.state.originalSize = {
				width: rect.width,
				height: rect.height,
				left: rect.left,
				top: rect.top
			};

			this.element.style.width = 'calc(100% - 20px)';
			this.element.style.height = 'calc(100% - 20px)';
			this.element.style.left = '10px';
			this.element.style.top = '10px';
			this.element.style.borderRadius = '0';
			this.state.isMaximized = true;
		}
	}

	private restoreSize(): void {
		if (this.state.isMaximized && this.state.originalSize) {
			this.element.style.width = `${this.state.originalSize.width}px`;
			this.element.style.height = `${this.state.originalSize.height}px`;
			this.element.style.left = `${this.state.originalSize.left}px`;
			this.element.style.top = `${this.state.originalSize.top}px`;
			this.element.style.borderRadius = '8px';
			this.state.isMaximized = false;
			this.state.originalSize = undefined;
		}
	}

	private closeModal(): void {
		// Dispatch custom event to notify modal manager
		const closeEvent = EventUtils.createCustomEvent('modalClose', { modal: this });
		this.element.dispatchEvent(closeEvent);
	}
}
