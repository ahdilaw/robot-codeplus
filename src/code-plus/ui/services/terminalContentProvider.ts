/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Robot Inc. 2025.
 *--------------------------------------------------------------------------------------------*/

import { IModalContentProvider } from './modalContentProvider.js';
import { VSCodeServiceType, IVSCodeServiceConfig } from './vscodeServiceBridge.js';
import { CodePlusServiceBridge } from './codePlusServiceBridge.js';
import { ITerminalService } from '../../../vs/workbench/contrib/terminal/browser/terminal.js';
import { Disposable } from '../../../vs/base/common/lifecycle.js';
import { TerminalLocation } from '../../../vs/platform/terminal/common/terminal.js';
import { ITerminalInstance } from '../../../vs/workbench/contrib/terminal/browser/terminal.js';

/**
 * Content provider that embeds the full VS Code terminal panel into a modal
 */
export class TerminalContentProvider extends Disposable implements IModalContentProvider {
	private terminalInstance?: ITerminalInstance;

	constructor() {
		super();
	}

	/**
	 * Create the terminal content for the modal
	 */
	async createContent(container: HTMLElement): Promise<void> {
		console.log('TerminalContentProvider: Creating terminal content...');

		// Ensure terminal services are available
		CodePlusServiceBridge.ensureTerminalServices();

		// Access services from the global bridge
		const globalServices = (globalThis as any).vscodeServices;

		if (!globalServices) {
			throw new Error('VS Code services not available for terminal modal');
		}

		console.log('TerminalContentProvider: Available services:', Object.keys(globalServices));

		// Check if terminal service is available
		if (!globalServices.terminalService) {
			throw new Error('Terminal service not available in global services bridge');
		}

		console.log('TerminalContentProvider: Creating simple terminal container...');

		// Create a simple container that will hold the terminal
		const terminalContainer = document.createElement('div');
		terminalContainer.className = 'terminal-container';
		terminalContainer.style.width = '100%';
		terminalContainer.style.height = '100%';
		terminalContainer.style.backgroundColor = '#1e1e1e';
		terminalContainer.style.color = '#ffffff';
		terminalContainer.style.fontFamily = 'monospace';
		terminalContainer.style.display = 'flex';
		terminalContainer.style.flexDirection = 'column';

		// Add container to modal
		container.appendChild(terminalContainer);

		// Create a terminal instance and attach to our container
		console.log('TerminalContentProvider: Creating terminal instance...');
		try {
			const terminalService = globalServices.terminalService as ITerminalService;
			const terminal = await terminalService.createTerminal({
				location: TerminalLocation.Panel,
				cwd: undefined
			});

			console.log('TerminalContentProvider: Terminal instance created:', terminal);

			// Store the terminal reference first
			this.terminalInstance = terminal;

			// Attach the terminal to our container
			console.log('TerminalContentProvider: Attaching terminal to container...');
			terminal.attachToElement(terminalContainer);

			// Set the terminal as visible so it initializes properly
			terminal.setVisible(true);

			// Wait for the terminal to be ready and then focus it
			console.log('TerminalContentProvider: Waiting for terminal to be ready...');
			await terminal.focusWhenReady();

			// Layout the terminal to the container dimensions
			const rect = terminalContainer.getBoundingClientRect();
			if (rect.width > 0 && rect.height > 0) {
				console.log('TerminalContentProvider: Laying out terminal with dimensions:', rect.width, rect.height);
				terminal.layout({ width: rect.width, height: rect.height });
			}

			console.log('TerminalContentProvider: Terminal attached and ready');

		} catch (error) {
			console.error('TerminalContentProvider: Failed to create terminal:', error);
			terminalContainer.innerHTML = `
				<div style="padding: 20px; text-align: center; color: #ff6b6b;">
					<h3>Terminal Error</h3>
					<p>Failed to create terminal instance:</p>
					<pre style="text-align: left; background: #2d2d2d; padding: 10px; border-radius: 4px;">${error}</pre>
				</div>
			`;
		}
	}

	/**
	 * Handle modal focus
	 */
	onFocus(): void {
		console.log('TerminalContentProvider: Modal focused, focusing terminal');
		if (this.terminalInstance) {
			// Focus the terminal instance
			this.terminalInstance.focus();
		}
	}

	/**
	 * Handle modal resize
	 */
	onResize(width: number, height: number): void {
		console.log(`TerminalContentProvider: Resize to ${width}x${height}`);

		if (this.terminalInstance) {
			// Layout the terminal to the new dimensions
			this.terminalInstance.layout({ width, height });
		}
	}

	/**
	 * Clean up the terminal instance
	 */
	override dispose(): void {
		if (this.terminalInstance) {
			this.terminalInstance.dispose();
			this.terminalInstance = undefined;
		}
		super.dispose();
	}

	/**
	 * Check if terminal content is ready
	 */
	isReady(): boolean {
		return !!this.terminalInstance;
	}

	/**
	 * Get the service type
	 */
	getServiceType(): VSCodeServiceType {
		return VSCodeServiceType.Terminal;
	}

	/**
	 * Get the service configuration
	 */
	getServiceConfig(): IVSCodeServiceConfig {
		return {
			type: VSCodeServiceType.Terminal,
			title: 'Terminal',
			icon: 'terminal',
			defaultWidth: 800,
			defaultHeight: 600,
			titleBarColor: '#1e1e1e',
			viewId: 'workbench.panel.terminal',
			panelId: 'workbench.panel.terminal'
		};
	}
}
