/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Robot Inc. 2025.
 *--------------------------------------------------------------------------------------------*/

/**
 * VS Code service types that can be embedded in modals
 */
export const enum VSCodeServiceType {
	Editor = 'editor',
	FileExplorer = 'file-explorer',
	Terminal = 'terminal',
	Extensions = 'extensions',
	Search = 'search',
	SourceControl = 'source-control',
	Debug = 'debug',
	Problems = 'problems',
	Output = 'output',
	Settings = 'settings',
	Marketplace = 'marketplace'
}

/**
 * Configuration for VS Code service integration
 */
export interface IVSCodeServiceConfig {
	type: VSCodeServiceType;
	title: string;
	icon: string;
	defaultWidth: number;
	defaultHeight: number;
	titleBarColor: string;
	viewId?: string; // VS Code view identifier
	panelId?: string; // VS Code panel identifier
	serviceKey?: string; // Service dependency injection key
}

/**
 * Registry of available VS Code services
 */
export class VSCodeServiceRegistry {
	private static services = new Map<VSCodeServiceType, IVSCodeServiceConfig>();

	static initialize(): void {
		console.log('VSCodeServiceRegistry: Starting initialization...');

		// Register all available VS Code services
		this.registerService({
			type: VSCodeServiceType.Editor,
			title: 'Text Editor',
			icon: '📝',
			defaultWidth: 800,
			defaultHeight: 600,
			titleBarColor: '#27ae60'
		});

		this.registerService({
			type: VSCodeServiceType.FileExplorer,
			title: 'File Explorer',
			icon: '📁',
			defaultWidth: 400,
			defaultHeight: 600,
			titleBarColor: '#3498db',
			viewId: 'workbench.explorer.fileView'
		});

		this.registerService({
			type: VSCodeServiceType.Terminal,
			title: 'Terminal',
			icon: '💻',
			defaultWidth: 800,
			defaultHeight: 400,
			titleBarColor: '#2c3e50',
			panelId: 'workbench.panel.terminal'
		});

		this.registerService({
			type: VSCodeServiceType.Extensions,
			title: 'Extensions',
			icon: '🧩',
			defaultWidth: 700,
			defaultHeight: 600,
			titleBarColor: '#9b59b6',
			viewId: 'workbench.view.extensions'
		});

		this.registerService({
			type: VSCodeServiceType.Search,
			title: 'Search',
			icon: '🔍',
			defaultWidth: 500,
			defaultHeight: 600,
			titleBarColor: '#e67e22',
			viewId: 'workbench.view.search'
		});

		this.registerService({
			type: VSCodeServiceType.SourceControl,
			title: 'Source Control',
			icon: '🌿',
			defaultWidth: 400,
			defaultHeight: 600,
			titleBarColor: '#16a085',
			viewId: 'workbench.scm'
		});

		this.registerService({
			type: VSCodeServiceType.Debug,
			title: 'Debug Console',
			icon: '🐛',
			defaultWidth: 600,
			defaultHeight: 400,
			titleBarColor: '#e74c3c',
			viewId: 'workbench.debug.console'
		});

		this.registerService({
			type: VSCodeServiceType.Problems,
			title: 'Problems',
			icon: '⚠️',
			defaultWidth: 700,
			defaultHeight: 300,
			titleBarColor: '#f39c12',
			panelId: 'workbench.panel.markers'
		});

		this.registerService({
			type: VSCodeServiceType.Output,
			title: 'Output',
			icon: '📤',
			defaultWidth: 700,
			defaultHeight: 300,
			titleBarColor: '#34495e',
			panelId: 'workbench.panel.output'
		});

		this.registerService({
			type: VSCodeServiceType.Settings,
			title: 'Settings',
			icon: '⚙️',
			defaultWidth: 800,
			defaultHeight: 600,
			titleBarColor: '#95a5a6'
		});

		console.log('VSCodeServiceRegistry: Initialization complete. Registered', this.services.size, 'services');
		console.log('Registered services:', Array.from(this.services.keys()));
	}

	static registerService(config: IVSCodeServiceConfig): void {
		this.services.set(config.type, config);
	}

	static getService(type: VSCodeServiceType): IVSCodeServiceConfig | undefined {
		return this.services.get(type);
	}

	static getAllServices(): IVSCodeServiceConfig[] {
		return Array.from(this.services.values());
	}

	static getServiceByTitle(title: string): IVSCodeServiceConfig | undefined {
		for (const service of this.services.values()) {
			if (service.title === title) {
				return service;
			}
		}
		return undefined;
	}
}

/**
 * Bridge for extracting and embedding VS Code services into modal windows
 * Simplified version for initial implementation
 */
export class VSCodeServiceBridge {
	private static instance: VSCodeServiceBridge;
	private workbench: any; // VS Code workbench instance
	// @ts-ignore - keeping for future service integration
	private instantiationService: any; // VS Code instantiation service
	// @ts-ignore - keeping for future service integration
	private viewDescriptorService: any; // VS Code view descriptor service
	// @ts-ignore - keeping for future service integration
	private panelService: any; // VS Code panel service

	static getInstance(): VSCodeServiceBridge {
		if (!this.instance) {
			this.instance = new VSCodeServiceBridge();
		}
		return this.instance;
	}

	/**
	 * Initialize the service bridge with VS Code workbench services
	 */
	initialize(): void {
		// Try to access VS Code services through various means
		try {
			// Method 1: Look for services in the global scope
			const global = globalThis as any;

			// Check for workbench instance
			if (global.workbench) {
				this.workbench = global.workbench;
				console.log('VSCodeServiceBridge: Found workbench in global scope');
			}

			// Method 2: Look for services in the DOM
			const workbenchElement = document.querySelector('.monaco-workbench');
			if (workbenchElement) {
				// Try to find service containers in the workbench
				const serviceAccessor = (workbenchElement as any).__serviceAccessor;
				if (serviceAccessor) {
					this.instantiationService = serviceAccessor.instantiationService;
					this.viewDescriptorService = serviceAccessor.viewDescriptorService;
					this.panelService = serviceAccessor.panelService;
					console.log('VSCodeServiceBridge: Found services through DOM');
				}
			}

			// Method 3: Access services through the current editor/view
			const editorElement = document.querySelector('.monaco-editor');
			if (editorElement) {
				const editorInstance = (editorElement as any).__editorInstance;
				if (editorInstance) {
					// Try to get services from editor instance
					console.log('VSCodeServiceBridge: Found editor instance');
				}
			}

			console.log('VSCodeServiceBridge: Initialization complete');
		} catch (error) {
			console.warn('VSCodeServiceBridge: Failed to access some services:', error);
		}
	}

	/**
	 * Extract a VS Code service DOM element for embedding in a modal
	 */
	async extractService(serviceType: VSCodeServiceType): Promise<HTMLElement | null> {
		const config = VSCodeServiceRegistry.getService(serviceType);
		if (!config) {
			console.error(`Service type ${serviceType} not registered`);
			return null;
		}

		try {
			switch (serviceType) {
				case VSCodeServiceType.Editor:
					return await this.extractEditorService();
				case VSCodeServiceType.FileExplorer:
					return await this.extractViewService('workbench.view.explorer');
				case VSCodeServiceType.Terminal:
					return await this.extractTerminalService();
				case VSCodeServiceType.Extensions:
					return await this.extractViewService('workbench.view.extensions');
				case VSCodeServiceType.Search:
					return await this.extractViewService('workbench.view.search');
				case VSCodeServiceType.SourceControl:
					return await this.extractViewService('workbench.view.scm');
				case VSCodeServiceType.Debug:
					return await this.extractViewService('workbench.view.debug');
				case VSCodeServiceType.Problems:
					return await this.extractPanelService('workbench.panel.markers');
				case VSCodeServiceType.Output:
					return await this.extractPanelService('workbench.panel.output');
				case VSCodeServiceType.Settings:
					return await this.extractSettingsService();
				default:
					console.warn(`Service extraction not implemented for ${serviceType}`);
					return this.createPlaceholderService(config);
			}
		} catch (error) {
			console.error(`Failed to extract service ${serviceType}:`, error);
			return this.createErrorService(config, error);
		}
	}

	/**
	 * Extract Monaco editor service
	 */
	private async extractEditorService(): Promise<HTMLElement> {
		// Create a standalone Monaco editor instance
		const editorContainer = document.createElement('div');
		editorContainer.style.cssText = `
			width: 100%;
			height: 100%;
			background: #1e1e1e;
			position: relative;
		`;

		try {
			// Import Monaco editor dynamically
			const monaco = await import('../../../vs/editor/editor.api.js');

			const editor = monaco.editor.create(editorContainer, {
				value: this.getDefaultEditorContent(),
				language: 'typescript',
				theme: 'vs-dark',
				automaticLayout: true,
				minimap: { enabled: true },
				scrollBeyondLastLine: false,
				fontSize: 14,
				lineNumbers: 'on',
				folding: true,
				wordWrap: 'on',
				formatOnPaste: true,
				formatOnType: true
			});

			// Store editor reference for cleanup
			(editorContainer as any).__monacoEditor = editor;

			return editorContainer;
		} catch (error) {
			console.error('Failed to create Monaco editor:', error);
			return this.createPlaceholderService(VSCodeServiceRegistry.getService(VSCodeServiceType.Editor)!);
		}
	}

	/**
	 * Extract terminal service
	 */
	private async extractTerminalService(): Promise<HTMLElement> {
		try {
			// Try to get the actual VS Code terminal
			const terminalElement = this.extractTerminalDOM();
			if (terminalElement) {
				return terminalElement;
			}
		} catch (error) {
			console.warn('Failed to extract VS Code terminal:', error);
		}

		// Fallback to placeholder terminal
		const terminalContainer = document.createElement('div');
		terminalContainer.style.cssText = `
			width: 100%;
			height: 100%;
			background: #000000;
			color: #ffffff;
			font-family: 'Consolas', 'Courier New', monospace;
			padding: 10px;
			overflow-y: auto;
		`;

		// Create terminal header
		const header = document.createElement('div');
		header.style.cssText = 'color: #00aa00; margin-bottom: 10px;';
		header.textContent = 'Terminal (Modal Mode)';
		terminalContainer.appendChild(header);

		// Create command lines
		const line1 = document.createElement('div');
		line1.style.cssText = 'color: #cccccc;';
		line1.textContent = 'PS C:\\> echo "Welcome to Code+ Terminal"';
		terminalContainer.appendChild(line1);

		const line2 = document.createElement('div');
		line2.style.cssText = 'color: #cccccc;';
		line2.textContent = 'Welcome to Code+ Terminal';
		terminalContainer.appendChild(line2);

		const promptLine = document.createElement('div');
		promptLine.style.cssText = 'color: #cccccc;';
		promptLine.textContent = 'PS C:\\> ';

		const cursor = document.createElement('span');
		cursor.style.cssText = 'border-left: 2px solid #00aa00; animation: blink 1s infinite;';
		cursor.textContent = ' '; // Use textContent instead of innerHTML
		promptLine.appendChild(cursor);
		terminalContainer.appendChild(promptLine);

		// Add blink animation
		const style = document.createElement('style');
		style.textContent = `
			@keyframes blink {
				0%, 50% { opacity: 1; }
				51%, 100% { opacity: 0; }
			}
		`;
		terminalContainer.appendChild(style);

		return terminalContainer;
	}

	/**
	 * Extract a view service (sidebar views like File Explorer, Extensions, etc.)
	 */
	private async extractViewService(viewId: string): Promise<HTMLElement> {
		try {
			// Try to get the actual VS Code view
			const viewElement = this.getVSCodeView(viewId);
			if (viewElement) {
				return viewElement;
			}
		} catch (error) {
			console.warn(`Failed to extract VS Code view ${viewId}:`, error);
		}

		// Fallback to creating a view instance
		return this.createViewInstance(viewId);
	}

	/**
	 * Extract a panel service (bottom panels like Terminal, Problems, etc.)
	 */
	private async extractPanelService(panelId: string): Promise<HTMLElement> {
		try {
			// Try to get the actual VS Code panel
			const panelElement = this.getVSCodePanel(panelId);
			if (panelElement) {
				return panelElement;
			}
		} catch (error) {
			console.warn(`Failed to extract VS Code panel ${panelId}:`, error);
		}

		// Fallback to creating a panel instance
		return this.createPanelInstance(panelId);
	}

	/**
	 * Extract VS Code settings service
	 */
	private async extractSettingsService(): Promise<HTMLElement> {
		// Create settings UI container
		const settingsContainer = document.createElement('div');
		settingsContainer.style.cssText = `
			width: 100%;
			height: 100%;
			background: #252526;
			color: #cccccc;
			overflow: auto;
		`;

		// For now, create a placeholder settings interface
		// This would integrate with VS Code's settings service in the future
		const padding = document.createElement('div');
		padding.style.cssText = 'padding: 20px;';

		const heading = document.createElement('h2');
		heading.style.cssText = 'color: #cccccc; margin-top: 0;';
		heading.textContent = 'Settings';
		padding.appendChild(heading);

		const description1 = document.createElement('p');
		description1.textContent = 'VS Code Settings integration will be implemented here.';
		padding.appendChild(description1);

		const description2 = document.createElement('p');
		description2.textContent = 'This modal will host the full VS Code settings editor.';
		padding.appendChild(description2);

		settingsContainer.appendChild(padding);

		return settingsContainer;
	}

	/**
	 * Create a new view instance for embedding
	 */
	private createViewInstance(viewId: string): HTMLElement {
		const container = document.createElement('div');
		container.style.cssText = `
			width: 100%;
			height: 100%;
			background: #252526;
			color: #cccccc;
			border: 1px solid #3e3e42;
		`;

		// Create view-specific content based on viewId
		switch (viewId) {
			case 'workbench.view.explorer':
				return this.createFileExplorerView(container);
			case 'workbench.view.extensions':
				return this.createExtensionsView(container);
			case 'workbench.view.search':
				return this.createSearchView(container);
			case 'workbench.view.scm':
				return this.createSourceControlView(container);
			case 'workbench.view.debug':
				return this.createDebugView(container);
			default:
				// Generic view placeholder
				const padding = document.createElement('div');
				padding.style.cssText = 'padding: 20px;';

				const heading = document.createElement('h3');
				heading.style.cssText = 'color: #cccccc; margin-top: 0;';
				heading.textContent = `VS Code View: ${viewId}`;
				padding.appendChild(heading);

				const description = document.createElement('p');
				description.textContent = 'This will host the actual VS Code view service.';
				padding.appendChild(description);

				container.appendChild(padding);
				return container;
		}
	}

	/**
	 * Create a new panel instance for embedding
	 */
	private createPanelInstance(panelId: string): HTMLElement {
		const container = document.createElement('div');
		container.style.cssText = `
			width: 100%;
			height: 100%;
			background: #252526;
			color: #cccccc;
		`;

		const padding = document.createElement('div');
		padding.style.cssText = 'padding: 20px;';

		const heading = document.createElement('h3');
		heading.style.cssText = 'color: #cccccc; margin-top: 0;';
		heading.textContent = `VS Code Panel: ${panelId}`;
		padding.appendChild(heading);

		const description = document.createElement('p');
		description.textContent = 'This will host the actual VS Code panel service.';
		padding.appendChild(description);

		container.appendChild(padding);

		return container;
	}
	/**
	 * Create placeholder service for unimplemented services
	 */
	private createPlaceholderService(config: IVSCodeServiceConfig): HTMLElement {
		const container = document.createElement('div');
		container.style.cssText = `
			width: 100%;
			height: 100%;
			background: #252526;
			color: #cccccc;
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			text-align: center;
			padding: 40px;
		`;

		const iconDiv = document.createElement('div');
		iconDiv.style.cssText = 'font-size: 48px; margin-bottom: 20px;';
		iconDiv.textContent = config.icon;
		container.appendChild(iconDiv);

		const title = document.createElement('h2');
		title.style.cssText = 'color: #cccccc; margin: 0 0 10px 0;';
		title.textContent = config.title;
		container.appendChild(title);

		const description = document.createElement('p');
		description.style.cssText = 'color: #999; margin: 0;';
		description.textContent = 'VS Code service integration coming soon...';
		container.appendChild(description);

		return container;
	}

	/**
	 * Create error service display
	 */
	private createErrorService(config: IVSCodeServiceConfig, error: any): HTMLElement {
		const container = document.createElement('div');
		container.style.cssText = `
			width: 100%;
			height: 100%;
			background: #252526;
			color: #cccccc;
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			text-align: center;
			padding: 40px;
		`;

		const iconDiv = document.createElement('div');
		iconDiv.style.cssText = 'font-size: 48px; margin-bottom: 20px; color: #e74c3c;';
		iconDiv.textContent = '⚠️';
		container.appendChild(iconDiv);

		const title = document.createElement('h2');
		title.style.cssText = 'color: #e74c3c; margin: 0 0 10px 0;';
		title.textContent = 'Service Error';
		container.appendChild(title);

		const description = document.createElement('p');
		description.style.cssText = 'color: #999; margin: 0 0 10px 0;';
		description.textContent = `Failed to load ${config.title}`;
		container.appendChild(description);

		const details = document.createElement('details');
		details.style.cssText = 'color: #666; font-size: 12px;';

		const summary = document.createElement('summary');
		summary.textContent = 'Error Details';
		details.appendChild(summary);

		const pre = document.createElement('pre');
		pre.style.cssText = 'margin-top: 10px; text-align: left;';
		pre.textContent = error.toString();
		details.appendChild(pre);

		container.appendChild(details);

		return container;
	}

	/**
	 * Get default content for Monaco editor
	 */
	private getDefaultEditorContent(): string {
		return `// Welcome to Code+ Text Editor
// Powered by Monaco Editor (VS Code's editor)

interface CodePlusFeatures {
	editor: 'Monaco Editor with full IntelliSense';
	fileExplorer: 'VS Code File Explorer service';
	terminal: 'Integrated terminal service';
	extensions: 'VS Code Extensions marketplace';
	search: 'Global search and replace';
	sourceControl: 'Git integration';
	debug: 'VS Code debugging tools';
	problems: 'Error and warning detection';
	output: 'Build and task output';
	settings: 'VS Code settings editor';
}

function demonstrateFeatures(): CodePlusFeatures {
	// Each modal window can host a different VS Code service
	// providing a modular, windowed development environment

	return {
		editor: 'Full Monaco editor with syntax highlighting, IntelliSense, and more',
		fileExplorer: 'Navigate and manage your project files',
		terminal: 'Run commands and scripts',
		extensions: 'Install and manage VS Code extensions',
		search: 'Search across your entire workspace',
		sourceControl: 'Manage Git repositories',
		debug: 'Debug your applications with breakpoints',
		problems: 'View compilation errors and warnings',
		output: 'See build logs and task outputs',
		settings: 'Configure your development environment'
	};
}

// Start coding!
console.log('Code+ is ready!');`;
	}

	/**
	 * Cleanup resources for a service
	 */
	cleanup(element: HTMLElement): void {
		// Cleanup Monaco editor if present
		const editor = (element as any).__monacoEditor;
		if (editor) {
			editor.dispose();
		}

		// Add other cleanup logic as needed
	}

	/**
	 * Get VS Code view element by ID
	 */
	private getVSCodeView(viewId: string): HTMLElement | null {
		try {
			// Access the view through the workbench
			if (!this.workbench) {
				throw new Error('Workbench not available');
			}

			// Try to find the view in the workbench DOM
			const workbenchElement = document.querySelector('.monaco-workbench');
			if (!workbenchElement) {
				throw new Error('Workbench element not found');
			}

			// Look for specific view containers
			switch (viewId) {
				case 'workbench.view.explorer':
					return this.extractFileExplorerDOM();
				case 'workbench.view.extensions':
					return this.extractExtensionsDOM();
				case 'workbench.view.search':
					return this.extractSearchDOM();
				case 'workbench.view.scm':
					return this.extractSourceControlDOM();
				case 'workbench.view.debug':
					return this.extractDebugDOM();
				default:
					throw new Error(`Unknown view ID: ${viewId}`);
			}
		} catch (error) {
			console.warn(`Failed to get VS Code view ${viewId}:`, error);
			return null;
		}
	}

	/**
	 * Get VS Code panel element by ID
	 */
	private getVSCodePanel(panelId: string): HTMLElement | null {
		try {
			if (!this.workbench) {
				throw new Error('Workbench not available');
			}

			// Look for specific panel containers
			switch (panelId) {
				case 'workbench.panel.terminal':
					return this.extractTerminalDOM();
				case 'workbench.panel.markers':
					return this.extractProblemsDOM();
				case 'workbench.panel.output':
					return this.extractOutputDOM();
				default:
					throw new Error(`Unknown panel ID: ${panelId}`);
			}
		} catch (error) {
			console.warn(`Failed to get VS Code panel ${panelId}:`, error);
			return null;
		}
	}

	/**
	 * Extract actual File Explorer DOM from VS Code
	 */
	private extractFileExplorerDOM(): HTMLElement {
		const explorerElement = document.querySelector('.explorer-viewlet, [data-keybinding-context="filesExplorerFocus"]');
		if (explorerElement) {
			// Clone the element to avoid affecting the original
			const cloned = explorerElement.cloneNode(true) as HTMLElement;
			cloned.style.width = '100%';
			cloned.style.height = '100%';
			return cloned;
		}
		throw new Error('File Explorer element not found');
	}

	/**
	 * Extract actual Extensions DOM from VS Code
	 */
	private extractExtensionsDOM(): HTMLElement {
		const extensionsElement = document.querySelector('.extensions-viewlet, [data-keybinding-context="extensionsViewletFocus"]');
		if (extensionsElement) {
			const cloned = extensionsElement.cloneNode(true) as HTMLElement;
			cloned.style.width = '100%';
			cloned.style.height = '100%';
			return cloned;
		}
		throw new Error('Extensions element not found');
	}

	/**
	 * Extract actual Search DOM from VS Code
	 */
	private extractSearchDOM(): HTMLElement {
		const searchElement = document.querySelector('.search-viewlet, [data-keybinding-context="searchViewletFocus"]');
		if (searchElement) {
			const cloned = searchElement.cloneNode(true) as HTMLElement;
			cloned.style.width = '100%';
			cloned.style.height = '100%';
			return cloned;
		}
		throw new Error('Search element not found');
	}

	/**
	 * Extract actual Source Control DOM from VS Code
	 */
	private extractSourceControlDOM(): HTMLElement {
		const scmElement = document.querySelector('.scm-viewlet, [data-keybinding-context="scmRepositoryFocus"]');
		if (scmElement) {
			const cloned = scmElement.cloneNode(true) as HTMLElement;
			cloned.style.width = '100%';
			cloned.style.height = '100%';
			return cloned;
		}
		throw new Error('Source Control element not found');
	}

	/**
	 * Extract actual Debug DOM from VS Code
	 */
	private extractDebugDOM(): HTMLElement {
		const debugElement = document.querySelector('.debug-viewlet, [data-keybinding-context="debuggersAvailable"]');
		if (debugElement) {
			const cloned = debugElement.cloneNode(true) as HTMLElement;
			cloned.style.width = '100%';
			cloned.style.height = '100%';
			return cloned;
		}
		throw new Error('Debug element not found');
	}

	/**
	 * Extract actual Terminal DOM from VS Code
	 */
	private extractTerminalDOM(): HTMLElement {
		const terminalElement = document.querySelector('.terminal-panel, .xterm-screen');
		if (terminalElement) {
			const cloned = terminalElement.cloneNode(true) as HTMLElement;
			cloned.style.width = '100%';
			cloned.style.height = '100%';
			return cloned;
		}
		throw new Error('Terminal element not found');
	}

	/**
	 * Extract actual Problems DOM from VS Code
	 */
	private extractProblemsDOM(): HTMLElement {
		const problemsElement = document.querySelector('.markers-panel, [data-keybinding-context="problemsViewFocus"]');
		if (problemsElement) {
			const cloned = problemsElement.cloneNode(true) as HTMLElement;
			cloned.style.width = '100%';
			cloned.style.height = '100%';
			return cloned;
		}
		throw new Error('Problems element not found');
	}

	/**
	 * Extract actual Output DOM from VS Code
	 */
	private extractOutputDOM(): HTMLElement {
		const outputElement = document.querySelector('.output-panel, [data-keybinding-context="outputPanelFocus"]');
		if (outputElement) {
			const cloned = outputElement.cloneNode(true) as HTMLElement;
			cloned.style.width = '100%';
			cloned.style.height = '100%';
			return cloned;
		}
		throw new Error('Output element not found');
	}

	// Fallback methods for when actual services aren't available
	private createFileExplorerView(container: HTMLElement): HTMLElement {
		this.createServicePlaceholder(container, 'File Explorer', '📁', 'File tree and workspace navigation');
		return container;
	}

	private createExtensionsView(container: HTMLElement): HTMLElement {
		this.createServicePlaceholder(container, 'Extensions', '🧩', 'VS Code extensions marketplace and management');
		return container;
	}

	private createSearchView(container: HTMLElement): HTMLElement {
		this.createServicePlaceholder(container, 'Search', '🔍', 'Search and replace across files');
		return container;
	}

	private createSourceControlView(container: HTMLElement): HTMLElement {
		this.createServicePlaceholder(container, 'Source Control', '🌿', 'Git integration and version control');
		return container;
	}

	private createDebugView(container: HTMLElement): HTMLElement {
		this.createServicePlaceholder(container, 'Debug', '🐛', 'Debugging tools and console');
		return container;
	}

	/**
	 * Create a service placeholder with realistic UI
	 */
	private createServicePlaceholder(container: HTMLElement, title: string, icon: string, description: string): void {
		// Clear container
		while (container.firstChild) {
			container.removeChild(container.firstChild);
		}

		// Create header
		const header = document.createElement('div');
		header.style.cssText = `
			display: flex;
			align-items: center;
			padding: 12px 16px;
			background: #2d2d30;
			border-bottom: 1px solid #3e3e42;
			color: #cccccc;
			font-weight: 600;
			font-size: 13px;
		`;

		const iconSpan = document.createElement('span');
		iconSpan.style.cssText = 'margin-right: 8px; font-size: 16px;';
		iconSpan.textContent = icon;

		const titleSpan = document.createElement('span');
		titleSpan.textContent = title;

		header.appendChild(iconSpan);
		header.appendChild(titleSpan);

		// Create content area
		const content = document.createElement('div');
		content.style.cssText = `
			flex: 1;
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			padding: 40px 20px;
			text-align: center;
			color: #cccccc;
		`;

		const statusIcon = document.createElement('div');
		statusIcon.style.cssText = 'font-size: 48px; margin-bottom: 16px; opacity: 0.7;';
		statusIcon.textContent = icon;

		const statusText = document.createElement('div');
		statusText.style.cssText = 'font-size: 14px; margin-bottom: 8px; font-weight: 500;';
		statusText.textContent = `${title} Service`;

		const descText = document.createElement('div');
		descText.style.cssText = 'font-size: 12px; color: #999; margin-bottom: 16px;';
		descText.textContent = description;

		const loadingIndicator = document.createElement('div');
		loadingIndicator.style.cssText = `
			display: flex;
			align-items: center;
			gap: 8px;
			font-size: 12px;
			color: #569cd6;
		`;

		const spinner = document.createElement('div');
		spinner.style.cssText = `
			width: 12px;
			height: 12px;
			border: 2px solid #3e3e42;
			border-top: 2px solid #569cd6;
			border-radius: 50%;
			animation: spin 1s linear infinite;
		`;

		const loadingText = document.createElement('span');
		loadingText.textContent = 'Loading VS Code service...';

		loadingIndicator.appendChild(spinner);
		loadingIndicator.appendChild(loadingText);

		content.appendChild(statusIcon);
		content.appendChild(statusText);
		content.appendChild(descText);
		content.appendChild(loadingIndicator);

		// Add components to container
		container.style.cssText = `
			display: flex;
			flex-direction: column;
			width: 100%;
			height: 100%;
			background: #252526;
		`;

		container.appendChild(header);
		container.appendChild(content);

		// Add spinner animation if not already present
		if (!document.head.querySelector('#vscode-service-spinner')) {
			const style = document.createElement('style');
			style.id = 'vscode-service-spinner';
			style.textContent = `
				@keyframes spin {
					from { transform: rotate(0deg); }
					to { transform: rotate(360deg); }
				}
			`;
			document.head.appendChild(style);
		}
	}
}
