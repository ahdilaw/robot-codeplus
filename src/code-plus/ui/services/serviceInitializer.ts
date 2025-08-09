/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Robot Inc. 2025.
 *--------------------------------------------------------------------------------------------*/

import { VSCodeServiceBridge, VSCodeServiceRegistry } from './vscodeServiceBridge.js';
import { ModalTypeRegistry } from './modalTypeRegistry.js';

/**
 * Service initializer for Code+ modal system
 * Simplified version for initial implementation
 */
export class CodePlusServiceInitializer {
	private static initialized = false;

	/**
	 * Initialize the Code+ modal system
	 */
	static async initialize(): Promise<void> {
		if (this.initialized) {
			return;
		}

		try {
			// Initialize VS Code service registry
			VSCodeServiceRegistry.initialize();

			// Initialize the service bridge
			const bridge = VSCodeServiceBridge.getInstance();
			bridge.initialize();

			// Initialize modal type registry
			ModalTypeRegistry.initialize();

			this.initialized = true;
			console.log('Code+ service system initialized successfully');

		} catch (error) {
			console.error('Failed to initialize Code+ service system:', error);
			throw error;
		}
	}

	/**
	 * Check if the service system is initialized
	 */
	static isInitialized(): boolean {
		return this.initialized;
	}

	/**
	 * Get the VS Code service bridge instance
	 */
	static getServiceBridge(): VSCodeServiceBridge {
		if (!this.initialized) {
			throw new Error('Service system not initialized. Call initialize() first.');
		}
		return VSCodeServiceBridge.getInstance();
	}

	/**
	 * Cleanup the service system
	 */
	static cleanup(): void {
		// Add cleanup logic if needed
		this.initialized = false;
	}
}
