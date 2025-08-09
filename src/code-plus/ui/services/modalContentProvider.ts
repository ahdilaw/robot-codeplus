/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Robot Inc. 2025.
 *--------------------------------------------------------------------------------------------*/

import { VSCodeServiceType, VSCodeServiceBridge, IVSCodeServiceConfig } from './vscodeServiceBridge.js';

/**
 * Interface for modal content providers
 */
export interface IModalContentProvider {
	/**
	 * Create the content for the modal
	 */
	createContent(container: HTMLElement): Promise<void>;

	/**
	 * Handle modal resize events
	 */
	onResize?(width: number, height: number): void;

	/**
	 * Handle modal focus events
	 */
	onFocus?(): void;

	/**
	 * Handle modal blur events
	 */
	onBlur?(): void;

	/**
	 * Handle modal activation (brought to front)
	 */
	onActivate?(): void;

	/**
	 * Handle modal deactivation
	 */
	onDeactivate?(): void;

	/**
	 * Cleanup resources when modal is closed
	 */
	dispose(): void;

	/**
	 * Get the service type this provider handles
	 */
	getServiceType(): VSCodeServiceType;

	/**
	 * Get the service configuration
	 */
	getServiceConfig(): IVSCodeServiceConfig;
}

/**
 * Base class for modal content providers
 */
export abstract class BaseModalContentProvider implements IModalContentProvider {
	protected container: HTMLElement | undefined;
	protected serviceElement: HTMLElement | undefined;
	protected isActive = false;

	constructor(
		protected serviceType: VSCodeServiceType,
		protected serviceConfig: IVSCodeServiceConfig
	) { }

	abstract createContent(container: HTMLElement): Promise<void>;

	onResize(width: number, height: number): void {
		if (this.serviceElement) {
			this.serviceElement.style.width = `${width}px`;
			this.serviceElement.style.height = `${height}px`;
		}
	}

	onFocus(): void {
		if (this.serviceElement) {
			// Try to focus the service element or its first focusable child
			const focusable = this.serviceElement.querySelector<HTMLElement>('input, textarea, button, [tabindex]');
			if (focusable) {
				focusable.focus();
			}
		}
	}

	onBlur(): void {
		// Override in subclasses if needed
	}

	onActivate(): void {
		this.isActive = true;
		if (this.container) {
			this.container.classList.add('active');
		}
	}

	onDeactivate(): void {
		this.isActive = false;
		if (this.container) {
			this.container.classList.remove('active');
		}
	}

	dispose(): void {
		if (this.serviceElement) {
			VSCodeServiceBridge.getInstance().cleanup(this.serviceElement);
		}
		this.container = undefined;
		this.serviceElement = undefined;
	}

	getServiceType(): VSCodeServiceType {
		return this.serviceType;
	}

	getServiceConfig(): IVSCodeServiceConfig {
		return this.serviceConfig;
	}

	/**
	 * Add common styling to the container
	 */
	protected styleContainer(container: HTMLElement): void {
		container.style.cssText = `
			width: 100%;
			height: 100%;
			background: #252526;
			color: #cccccc;
			overflow: hidden;
			position: relative;
			font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
		`;
		container.className = 'vscode-service-container';
	}

	/**
	 * Show loading state while service is being extracted
	 */
	protected showLoading(container: HTMLElement, serviceName: string): void {
		// Clear container safely
		while (container.firstChild) {
			container.removeChild(container.firstChild);
		}

		// Create loading container
		const loadingDiv = document.createElement('div');
		loadingDiv.style.cssText = `
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			height: 100%;
			color: #cccccc;
		`;

		// Create spinner
		const spinner = document.createElement('div');
		spinner.style.cssText = `
			font-size: 24px;
			margin-bottom: 16px;
			animation: spin 1s linear infinite;
		`;
		spinner.textContent = '⚙️';

		// Create loading text
		const loadingText = document.createElement('p');
		loadingText.style.cssText = 'margin: 0; font-size: 14px;';
		loadingText.textContent = `Loading ${serviceName}...`;

		// Add keyframes animation
		const style = document.createElement('style');
		style.textContent = `
			@keyframes spin {
				from { transform: rotate(0deg); }
				to { transform: rotate(360deg); }
			}
		`;

		// Append elements
		loadingDiv.appendChild(spinner);
		loadingDiv.appendChild(loadingText);
		container.appendChild(loadingDiv);

		// Add style to head if not already present
		if (!document.head.querySelector('style[data-spinner]')) {
			style.setAttribute('data-spinner', 'true');
			document.head.appendChild(style);
		}
	}
}

/**
 * VS Code service content provider
 */
export class VSCodeServiceContentProvider extends BaseModalContentProvider {
	constructor(serviceType: VSCodeServiceType, serviceConfig: IVSCodeServiceConfig) {
		super(serviceType, serviceConfig);
	}

	async createContent(container: HTMLElement): Promise<void> {
		this.container = container;
		this.styleContainer(container);

		// Show loading state
		this.showLoading(container, this.serviceConfig.title);

		try {
			// Extract the VS Code service
			const serviceBridge = VSCodeServiceBridge.getInstance();
			const extractedElement = await serviceBridge.extractService(this.serviceType);

			if (extractedElement) {
				this.serviceElement = extractedElement;
				// Clear loading state and add service
				while (container.firstChild) {
					container.removeChild(container.firstChild);
				}
				container.appendChild(this.serviceElement);

				// Apply service-specific styling
				this.applyServiceStyling();
			} else {
				this.showError(container, 'Failed to load service');
			}
		} catch (error) {
			console.error(`Failed to create ${this.serviceType} content:`, error);
			this.showError(container, error instanceof Error ? error.message : 'Unknown error');
		}
	}

	/**
	 * Apply service-specific styling and behavior
	 */
	private applyServiceStyling(): void {
		if (!this.serviceElement) return;

		// Ensure service element fills the container
		this.serviceElement.style.width = '100%';
		this.serviceElement.style.height = '100%';
		this.serviceElement.style.border = 'none';
		this.serviceElement.style.outline = 'none';

		// Add service-specific styling based on type
		switch (this.serviceType) {
			case VSCodeServiceType.Editor:
				this.styleEditorService();
				break;
			case VSCodeServiceType.Terminal:
				this.styleTerminalService();
				break;
			case VSCodeServiceType.FileExplorer:
				this.styleFileExplorerService();
				break;
			// Add more service-specific styling as needed
		}
	}

	private styleEditorService(): void {
		if (!this.serviceElement) return;

		// Editor-specific styling
		this.serviceElement.style.background = '#1e1e1e';

		// Add editor toolbar if it doesn't exist
		if (!this.serviceElement.querySelector('.editor-toolbar')) {
			const toolbar = this.createEditorToolbar();
			this.serviceElement.insertBefore(toolbar, this.serviceElement.firstChild);
		}
	}

	private styleTerminalService(): void {
		if (!this.serviceElement) return;

		// Terminal-specific styling
		this.serviceElement.style.background = '#0c0c0c';
		this.serviceElement.style.fontFamily = 'Consolas, "Courier New", monospace';
	}

	private styleFileExplorerService(): void {
		if (!this.serviceElement) return;

		// File explorer-specific styling
		this.serviceElement.style.background = '#252526';
	}

	/**
	 * Create editor toolbar
	 */
	private createEditorToolbar(): HTMLElement {
		const toolbar = document.createElement('div');
		toolbar.className = 'editor-toolbar';
		toolbar.style.cssText = `
			height: 35px;
			background: #2d2d30;
			border-bottom: 1px solid #3e3e42;
			display: flex;
			align-items: center;
			padding: 0 12px;
			gap: 12px;
			flex-shrink: 0;
		`;

		// Add toolbar buttons
		const newFileBtn = this.createToolbarButton('New', '📄', () => this.newFile());
		const saveBtn = this.createToolbarButton('Save', '💾', () => this.saveFile());
		const formatBtn = this.createToolbarButton('Format', '🎨', () => this.formatDocument());

		toolbar.appendChild(newFileBtn);
		toolbar.appendChild(saveBtn);
		toolbar.appendChild(formatBtn);

		// Add language selector
		const languageSelector = this.createLanguageSelector();
		toolbar.appendChild(languageSelector);

		return toolbar;
	}

	/**
	 * Create toolbar button
	 */
	private createToolbarButton(title: string, icon: string, onClick: () => void): HTMLElement {
		const button = document.createElement('button');
		button.title = title;
		button.style.cssText = `
			background: transparent;
			border: 1px solid transparent;
			color: #cccccc;
			padding: 4px 8px;
			border-radius: 3px;
			cursor: pointer;
			font-size: 12px;
			display: flex;
			align-items: center;
			gap: 4px;
		`;

		// Create icon and title spans
		const iconSpan = document.createElement('span');
		iconSpan.textContent = icon;
		const titleSpan = document.createElement('span');
		titleSpan.textContent = title;

		button.appendChild(iconSpan);
		button.appendChild(titleSpan);

		button.addEventListener('mouseenter', () => {
			button.style.background = '#3e3e42';
			button.style.borderColor = '#5a5a5a';
		});

		button.addEventListener('mouseleave', () => {
			button.style.background = 'transparent';
			button.style.borderColor = 'transparent';
		});

		button.addEventListener('click', onClick);

		return button;
	}

	/**
	 * Create language selector dropdown
	 */
	private createLanguageSelector(): HTMLElement {
		const container = document.createElement('div');
		container.style.cssText = `
			margin-left: auto;
			display: flex;
			align-items: center;
			gap: 8px;
		`;

		const label = document.createElement('span');
		label.textContent = 'Language:';
		label.style.cssText = `
			color: #cccccc;
			font-size: 12px;
		`;

		const select = document.createElement('select');
		select.style.cssText = `
			background: #3c3c3c;
			color: #cccccc;
			border: 1px solid #5a5a5a;
			border-radius: 3px;
			padding: 2px 6px;
			font-size: 12px;
		`;

		const languages = [
			'javascript', 'typescript', 'python', 'html', 'css', 'json',
			'markdown', 'sql', 'yaml', 'xml', 'shell', 'powershell'
		];

		languages.forEach(lang => {
			const option = document.createElement('option');
			option.value = lang;
			option.textContent = lang.toUpperCase();
			select.appendChild(option);
		});

		select.addEventListener('change', () => {
			this.changeLanguage(select.value);
		});

		container.appendChild(label);
		container.appendChild(select);

		return container;
	}

	/**
	 * Handle new file action
	 */
	private newFile(): void {
		// Get Monaco editor instance and create new file
		const editor = (this.serviceElement as any)?.__monacoEditor;
		if (editor) {
			editor.setValue('// New file\n');
			editor.focus();
		}
	}

	/**
	 * Handle save file action
	 */
	private saveFile(): void {
		// Implement save functionality
		const editor = (this.serviceElement as any)?.__monacoEditor;
		if (editor) {
			const content = editor.getValue();
			console.log('Saving file content:', content);
			// TODO: Implement actual file saving
		}
	}

	/**
	 * Handle format document action
	 */
	private formatDocument(): void {
		const editor = (this.serviceElement as any)?.__monacoEditor;
		if (editor) {
			editor.getAction('editor.action.formatDocument')?.run();
		}
	}

	/**
	 * Handle language change
	 */
	private changeLanguage(language: string): void {
		const editor = (this.serviceElement as any)?.__monacoEditor;
		if (editor) {
			const model = editor.getModel();
			if (model) {
				// Dynamically import Monaco to access setModelLanguage
				import('../../../vs/editor/editor.api.js').then(monaco => {
					monaco.editor.setModelLanguage(model, language);
				});
			}
		}
	}

	/**
	 * Handle resize events for specific services
	 */
	override onResize(width: number, height: number): void {
		super.onResize(width, height);

		// Handle Monaco editor resize
		if (this.serviceType === VSCodeServiceType.Editor) {
			const editor = (this.serviceElement as any)?.__monacoEditor;
			if (editor) {
				// Account for toolbar height
				const toolbarHeight = 35;
				editor.layout({
					width: width,
					height: height - toolbarHeight
				});
			}
		}
	}

	/**
	 * Show error state
	 */
	private showError(container: HTMLElement, message: string): void {
		// Clear container safely
		while (container.firstChild) {
			container.removeChild(container.firstChild);
		}

		// Create error container
		const errorDiv = document.createElement('div');
		errorDiv.style.cssText = `
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			height: 100%;
			color: #e74c3c;
			text-align: center;
			padding: 20px;
		`;

		// Create error icon
		const errorIcon = document.createElement('div');
		errorIcon.style.cssText = 'font-size: 48px; margin-bottom: 16px;';
		errorIcon.textContent = '⚠️';

		// Create error title
		const errorTitle = document.createElement('h3');
		errorTitle.style.cssText = 'margin: 0 0 8px 0; color: #e74c3c;';
		errorTitle.textContent = 'Service Error';

		// Create error message
		const errorMessage = document.createElement('p');
		errorMessage.style.cssText = 'margin: 0; color: #cccccc; font-size: 14px;';
		errorMessage.textContent = message;

		// Append elements
		errorDiv.appendChild(errorIcon);
		errorDiv.appendChild(errorTitle);
		errorDiv.appendChild(errorMessage);
		container.appendChild(errorDiv);
	}
}
