/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Robot Inc. 2025.
 *--------------------------------------------------------------------------------------------*/

import { Launchpad } from './launchpad.js';
import { ModalManager } from './modalManager.js';
import { ModalTypeRegistry, IEnhancedModalDefinition } from './services/modalTypeRegistry.js';
import { VSCodeServiceBridge } from './services/vscodeServiceBridge.js';
import { CodePlusServiceBridge } from './services/codePlusServiceBridge.js';

/**
 * Code+ workbench integration
 * This class initializes the modal system
 */
export class CodePlusWorkbenchIntegration {
	private launchpad: Launchpad | undefined;
	private modalManager: ModalManager | undefined;
	private initialized = false;

	constructor() {
		this.initializeCodePlusSystem();
	}

	private async initializeCodePlusSystem(): Promise<void> {
		try {
			console.log('CodePlusWorkbenchIntegration: Starting initialization...');

			// The service bridge is already initialized by the workbench
			// Just verify it's available
			const serviceBridge = CodePlusServiceBridge.getInstance();
			if (!serviceBridge) {
				throw new Error('CodePlusServiceBridge not initialized by workbench');
			}

			// Initialize modal type registry FIRST
			ModalTypeRegistry.initialize();

			// Initialize VS Code service bridge
			const vscodeServiceBridge = VSCodeServiceBridge.getInstance();
			vscodeServiceBridge.initialize();

			// Create modal manager
			this.modalManager = new ModalManager();
			console.log('CodePlusWorkbenchIntegration: Modal manager created');

			// Create launchpad
			this.launchpad = new Launchpad();
			console.log('CodePlusWorkbenchIntegration: Launchpad created');

			// Initialize modal definitions in launchpad AFTER registry is ready
			this.launchpad.refreshModalDefinitions();

			// Set up launchpad modal launch callback
			this.launchpad.onLaunchModal((modalDef: IEnhancedModalDefinition) => {
				this.openModal(modalDef);
			});

			// Add launchpad to DOM
			this.addLaunchpadToWorkbench();

			// Set up keyboard shortcut to open launchpad (Cmd/Ctrl + Shift + Space)
			this.setupKeyboardShortcuts();

			this.initialized = true;
			console.log('Code+ workbench integration initialized successfully');

		} catch (error) {
			console.error('Failed to initialize Code+ workbench integration:', error);
		}
	}

	private addLaunchpadToWorkbench(): void {
		if (!this.launchpad) {
			return;
		}

		// Add launchpad element to document body
		document.body.appendChild(this.launchpad.getElement());
	}

	private setupKeyboardShortcuts(): void {
		// Register keyboard shortcut to toggle launchpad
		document.addEventListener('keydown', (event: KeyboardEvent) => {
			// Cmd/Ctrl + Shift + Space
			if ((event.metaKey || event.ctrlKey) && event.shiftKey && event.code === 'Space') {
				event.preventDefault();
				this.toggleLaunchpad();
			}
		});
	}

	private toggleLaunchpad(): void {
		console.log('CodePlusWorkbenchIntegration: Toggle launchpad called');
		if (!this.launchpad) {
			console.error('CodePlusWorkbenchIntegration: Launchpad not initialized!');
			return;
		}

		console.log('CodePlusWorkbenchIntegration: Toggling launchpad visibility');
		this.launchpad.toggle();
	}

	private openModal(modalDef: IEnhancedModalDefinition): void {
		if (!this.modalManager) {
			return;
		}

		// Calculate position for new modal (offset from previous modals)
		const existingModals = this.modalManager.getAllModals();
		const offset = existingModals.length * 30;
		const left = 100 + offset;
		const top = 100 + offset;

		// Create the modal
		const modalElement = this.modalManager.createModal(
			modalDef.title,
			modalDef.width,
			modalDef.height,
			left,
			top,
			modalDef.titleBarColor
		);

		// Add modal to document body
		document.body.appendChild(modalElement);
	}

	/**
	 * Public API for opening modals programmatically
	 */
	public openModalByTitle(title: string): void {
		const modalDef = ModalTypeRegistry.getModalDefinition(title);
		if (modalDef) {
			this.openModal(modalDef);
		} else {
			console.warn(`Modal type '${title}' not found`);
		}
	}

	/**
	 * Public API for getting available modal types
	 */
	public getAvailableModalTypes(): IEnhancedModalDefinition[] {
		return ModalTypeRegistry.getAllModalDefinitions();
	}

	/**
	 * Public API for accessing the launchpad
	 */
	public getLaunchpad(): Launchpad | undefined {
		return this.launchpad;
	}

	/**
	 * Public API for accessing the modal manager
	 */
	public getModalManager(): ModalManager | undefined {
		return this.modalManager;
	}

	/**
	 * Check if the system is initialized
	 */
	public isInitialized(): boolean {
		return this.initialized;
	}

	/**
	 * Clean up resources when shutting down
	 */
	public dispose(): void {
		// Clean up launchpad
		if (this.launchpad) {
			// Launchpad doesn't have dispose method, just clear reference
			this.launchpad = undefined;
		}

		// Clean up modal manager
		if (this.modalManager) {
			this.modalManager.closeAllModals();
			this.modalManager = undefined;
		}

		// Clean up service bridge
		const serviceBridge = CodePlusServiceBridge.getInstance();
		if (serviceBridge) {
			serviceBridge.dispose();
		}

		this.initialized = false;
		console.log('CodePlusWorkbenchIntegration: Disposed');
	}
}

// No longer auto-initialize - CustomUIManager will create the integration instance
