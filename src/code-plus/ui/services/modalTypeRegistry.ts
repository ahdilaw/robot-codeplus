/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Robot Inc. 2025.
 *--------------------------------------------------------------------------------------------*/

import { VSCodeServiceType, VSCodeServiceRegistry, IVSCodeServiceConfig } from './vscodeServiceBridge.js';
import { IModalContentProvider, VSCodeServiceContentProvider } from './modalContentProvider.js';
import { TextEditorContentProvider } from './textEditorContentProvider.js';
import { TerminalContentProvider } from './terminalContentProvider.js';

/**
 * Factory function for creating modal content providers
 */
export type ModalContentProviderFactory = () => IModalContentProvider;

/**
 * Modal definition that includes VS Code service information
 */
export interface IEnhancedModalDefinition {
	title: string;
	width: number;
	height: number;
	titleBarColor: string;
	icon: string;
	serviceType?: VSCodeServiceType;
	category?: 'vscode' | 'custom' | 'utility';
	description?: string;
}

/**
 * Registry for modal types and their content providers
 */
export class ModalTypeRegistry {
	private static contentProviders = new Map<string, ModalContentProviderFactory>();
	private static modalDefinitions = new Map<string, IEnhancedModalDefinition>();

	/**
	 * Initialize the registry with VS Code services and custom modals
	 */
	static initialize(): void {
		console.log('ModalTypeRegistry: Starting initialization...');

		// Initialize VS Code service registry first
		VSCodeServiceRegistry.initialize();

		// Register all VS Code services as modal types
		this.registerVSCodeServices();

		// Register custom modal types
		this.registerCustomModals();

		console.log('ModalTypeRegistry: Initialization complete. Registered', this.modalDefinitions.size, 'modal types');
		console.log('Registered modal titles:', Array.from(this.modalDefinitions.keys()));
	}

	/**
	 * Register all VS Code services as modal types
	 */
	private static registerVSCodeServices(): void {
		const services = VSCodeServiceRegistry.getAllServices();

		services.forEach(service => {
			const modalDef: IEnhancedModalDefinition = {
				title: service.title,
				width: service.defaultWidth,
				height: service.defaultHeight,
				titleBarColor: service.titleBarColor,
				icon: service.icon,
				serviceType: service.type,
				category: 'vscode',
				description: this.getServiceDescription(service.type)
			};

			// Use custom TextEditorContentProvider for the editor service
			if (service.type === VSCodeServiceType.Editor) {
				this.registerModalType(
					service.title,
					modalDef,
					() => {
						// Get the instantiation service from VS Code's service locator
						// This will be injected at runtime when the modal is created
						const instantiationService = (globalThis as any).vscodeServices?.instantiationService;
						const modelService = (globalThis as any).vscodeServices?.modelService;
						const languageService = (globalThis as any).vscodeServices?.languageService;

						if (!instantiationService || !modelService || !languageService) {
							console.warn('VS Code services not available, falling back to default provider');
							return new VSCodeServiceContentProvider(service.type, service);
						}

						return new TextEditorContentProvider(instantiationService, modelService, languageService);
					}
				);
			} else {
				this.registerModalType(
					service.title,
					modalDef,
					() => new VSCodeServiceContentProvider(service.type, service)
				);
			}
		});
	}

	/**
	 * Register custom (non-VS Code) modal types
	 */
	private static registerCustomModals(): void {
		// Register terminal modal (VS Code integrated terminal)
		this.registerModalType(
			'Terminal',
			{
				title: 'Terminal',
				width: 800,
				height: 600,
				titleBarColor: '#2c3e50',
				icon: '💻',
				category: 'vscode',
				description: 'Integrated terminal with full VS Code functionality'
			},
			() => new TerminalContentProvider()
		);

		// Register utility modals
		this.registerModalType(
			'Calculator',
			{
				title: 'Calculator',
				width: 300,
				height: 400,
				titleBarColor: '#e74c3c',
				icon: '🧮',
				category: 'utility',
				description: 'Basic calculator application'
			},
			() => new CalculatorContentProvider()
		);

		this.registerModalType(
			'Notes',
			{
				title: 'Notes',
				width: 500,
				height: 600,
				titleBarColor: '#f39c12',
				icon: '📝',
				category: 'utility',
				description: 'Simple note-taking application'
			},
			() => new NotesContentProvider()
		);

		this.registerModalType(
			'Color Picker',
			{
				title: 'Color Picker',
				width: 400,
				height: 500,
				titleBarColor: '#9b59b6',
				icon: '🎨',
				category: 'utility',
				description: 'Color selection and palette tool'
			},
			() => new ColorPickerContentProvider()
		);
	}

	/**
	 * Register a modal type with its content provider factory
	 */
	static registerModalType(
		title: string,
		definition: IEnhancedModalDefinition,
		factory: ModalContentProviderFactory
	): void {
		this.contentProviders.set(title, factory);
		this.modalDefinitions.set(title, definition);
	}

	/**
	 * Create a content provider for a modal type
	 */
	static createContentProvider(title: string): IModalContentProvider | undefined {
		const factory = this.contentProviders.get(title);
		return factory ? factory() : undefined;
	}

	/**
	 * Get modal definition by title
	 */
	static getModalDefinition(title: string): IEnhancedModalDefinition | undefined {
		return this.modalDefinitions.get(title);
	}

	/**
	 * Get all modal definitions
	 */
	static getAllModalDefinitions(): IEnhancedModalDefinition[] {
		return Array.from(this.modalDefinitions.values());
	}

	/**
	 * Get modal definitions by category
	 */
	static getModalDefinitionsByCategory(category: string): IEnhancedModalDefinition[] {
		return Array.from(this.modalDefinitions.values())
			.filter(def => def.category === category);
	}

	/**
	 * Check if a modal type is registered
	 */
	static isRegistered(title: string): boolean {
		return this.contentProviders.has(title);
	}

	/**
	 * Get VS Code service description
	 */
	private static getServiceDescription(serviceType: VSCodeServiceType): string {
		const descriptions: Record<VSCodeServiceType, string> = {
			[VSCodeServiceType.Editor]: 'Full-featured code editor with syntax highlighting, IntelliSense, and debugging support',
			[VSCodeServiceType.FileExplorer]: 'Browse and manage your project files and folders',
			[VSCodeServiceType.Terminal]: 'Integrated terminal for running commands and scripts',
			[VSCodeServiceType.Extensions]: 'Discover, install, and manage VS Code extensions',
			[VSCodeServiceType.Search]: 'Search and replace across your entire workspace',
			[VSCodeServiceType.SourceControl]: 'Git integration for version control management',
			[VSCodeServiceType.Debug]: 'Debug your applications with breakpoints and variable inspection',
			[VSCodeServiceType.Problems]: 'View compilation errors, warnings, and other issues',
			[VSCodeServiceType.Output]: 'View build logs, task outputs, and extension logs',
			[VSCodeServiceType.Settings]: 'Configure VS Code settings and preferences',
			[VSCodeServiceType.Marketplace]: 'Browse and install extensions from the marketplace'
		};

		return descriptions[serviceType] || 'VS Code service integration';
	}
}

/**
 * Base class for custom content providers
 */
abstract class CustomContentProvider implements IModalContentProvider {
	protected container: HTMLElement | undefined;

	abstract createContent(container: HTMLElement): Promise<void>;
	abstract getServiceType(): VSCodeServiceType;
	abstract getServiceConfig(): IVSCodeServiceConfig;

	onResize?(width: number, height: number): void { }
	onFocus?(): void { }
	onBlur?(): void { }
	onActivate?(): void { }
	onDeactivate?(): void { }

	dispose(): void {
		this.container = undefined;
	}

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
	}
}

/**
 * Calculator content provider
 */
class CalculatorContentProvider extends CustomContentProvider {
	async createContent(container: HTMLElement): Promise<void> {
		this.container = container;
		this.styleContainer(container);

		container.innerHTML = `
			<div style="
				display: flex;
				flex-direction: column;
				height: 100%;
				padding: 20px;
				background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
			">
				<div style="
					background: #000;
					color: #0f0;
					padding: 15px;
					margin-bottom: 20px;
					border-radius: 8px;
					font-family: 'Courier New', monospace;
					font-size: 24px;
					text-align: right;
					border: 2px solid #333;
				" id="calc-display">0</div>

				<div style="
					display: grid;
					grid-template-columns: repeat(4, 1fr);
					gap: 10px;
					flex: 1;
				" id="calc-buttons">
					<!-- Calculator buttons will be added here -->
				</div>
			</div>
		`;

		this.setupCalculator();
	}

	private setupCalculator(): void {
		const buttonsContainer = this.container?.querySelector('#calc-buttons');
		const display = this.container?.querySelector('#calc-display') as HTMLElement;

		if (!buttonsContainer || !display) return;

		const buttons = [
			'C', '±', '%', '÷',
			'7', '8', '9', '×',
			'4', '5', '6', '−',
			'1', '2', '3', '+',
			'0', '.', '='
		];

		let currentValue = '0';
		let operator = '';
		let previousValue = '';

		buttons.forEach((btn, index) => {
			const button = document.createElement('button');
			button.textContent = btn;
			button.style.cssText = `
				background: ${btn === '=' ? '#ff9500' : ['÷', '×', '−', '+'].includes(btn) ? '#ff9500' : '#333'};
				color: white;
				border: none;
				border-radius: 8px;
				font-size: 18px;
				font-weight: bold;
				cursor: pointer;
				transition: all 0.2s;
				${btn === '0' ? 'grid-column: span 2;' : ''}
			`;

			button.addEventListener('mouseenter', () => {
				button.style.transform = 'scale(1.05)';
				button.style.boxShadow = '0 4px 8px rgba(0,0,0,0.3)';
			});

			button.addEventListener('mouseleave', () => {
				button.style.transform = 'scale(1)';
				button.style.boxShadow = 'none';
			});

			button.addEventListener('click', () => {
				// Calculator logic here
				if (btn === 'C') {
					currentValue = '0';
					operator = '';
					previousValue = '';
				} else if (['+', '−', '×', '÷'].includes(btn)) {
					operator = btn;
					previousValue = currentValue;
					currentValue = '0';
				} else if (btn === '=') {
					if (operator && previousValue) {
						const prev = parseFloat(previousValue);
						const curr = parseFloat(currentValue);
						let result = 0;

						switch (operator) {
							case '+': result = prev + curr; break;
							case '−': result = prev - curr; break;
							case '×': result = prev * curr; break;
							case '÷': result = prev / curr; break;
						}

						currentValue = result.toString();
						operator = '';
						previousValue = '';
					}
				} else if (btn === '.') {
					if (!currentValue.includes('.')) {
						currentValue += '.';
					}
				} else if (btn === '±') {
					currentValue = (parseFloat(currentValue) * -1).toString();
				} else if (btn === '%') {
					currentValue = (parseFloat(currentValue) / 100).toString();
				} else {
					if (currentValue === '0') {
						currentValue = btn;
					} else {
						currentValue += btn;
					}
				}

				display.textContent = currentValue;
			});

			buttonsContainer.appendChild(button);
		});
	}

	getServiceType(): VSCodeServiceType {
		return VSCodeServiceType.Editor; // Placeholder
	}

	getServiceConfig(): IVSCodeServiceConfig {
		return {
			type: VSCodeServiceType.Editor,
			title: 'Calculator',
			icon: '🧮',
			defaultWidth: 300,
			defaultHeight: 400,
			titleBarColor: '#e74c3c'
		};
	}
}

/**
 * Notes content provider
 */
class NotesContentProvider extends CustomContentProvider {
	async createContent(container: HTMLElement): Promise<void> {
		this.container = container;
		this.styleContainer(container);

		container.innerHTML = `
			<div style="
				display: flex;
				flex-direction: column;
				height: 100%;
				background: #252526;
			">
				<div style="
					height: 40px;
					background: #2d2d30;
					border-bottom: 1px solid #3e3e42;
					display: flex;
					align-items: center;
					padding: 0 15px;
					gap: 10px;
				">
					<button id="new-note" style="
						background: #0e639c;
						color: white;
						border: none;
						padding: 6px 12px;
						border-radius: 3px;
						font-size: 12px;
						cursor: pointer;
					">New Note</button>
					<button id="save-note" style="
						background: #0e639c;
						color: white;
						border: none;
						padding: 6px 12px;
						border-radius: 3px;
						font-size: 12px;
						cursor: pointer;
					">Save</button>
				</div>
				<textarea style="
					flex: 1;
					background: #1e1e1e;
					color: #cccccc;
					border: none;
					padding: 20px;
					font-family: 'Consolas', 'Courier New', monospace;
					font-size: 14px;
					line-height: 1.5;
					resize: none;
					outline: none;
				" placeholder="Start typing your notes here..."></textarea>
			</div>
		`;

		this.setupNotes();
	}

	private setupNotes(): void {
		const newBtn = this.container?.querySelector('#new-note') as HTMLButtonElement;
		const saveBtn = this.container?.querySelector('#save-note') as HTMLButtonElement;
		const textarea = this.container?.querySelector('textarea') as HTMLTextAreaElement;

		if (newBtn) {
			newBtn.addEventListener('click', () => {
				if (textarea) {
					textarea.value = '';
					textarea.focus();
				}
			});
		}

		if (saveBtn) {
			saveBtn.addEventListener('click', () => {
				if (textarea) {
					console.log('Saving note:', textarea.value);
					// TODO: Implement actual note saving
				}
			});
		}
	}

	getServiceType(): VSCodeServiceType {
		return VSCodeServiceType.Editor; // Placeholder
	}

	getServiceConfig(): IVSCodeServiceConfig {
		return {
			type: VSCodeServiceType.Editor,
			title: 'Notes',
			icon: '📝',
			defaultWidth: 500,
			defaultHeight: 600,
			titleBarColor: '#f39c12'
		};
	}
}

/**
 * Color Picker content provider
 */
class ColorPickerContentProvider extends CustomContentProvider {
	async createContent(container: HTMLElement): Promise<void> {
		this.container = container;
		this.styleContainer(container);

		container.innerHTML = `
			<div style="
				display: flex;
				flex-direction: column;
				height: 100%;
				padding: 20px;
				background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
			">
				<h2 style="color: white; margin: 0 0 20px 0; text-align: center;">Color Picker</h2>

				<div style="
					background: white;
					border-radius: 12px;
					padding: 20px;
					flex: 1;
					display: flex;
					flex-direction: column;
					gap: 20px;
				">
					<input type="color" id="color-input" style="
						width: 100%;
						height: 60px;
						border: none;
						border-radius: 8px;
						cursor: pointer;
					" value="#3498db">

					<div id="color-info" style="
						background: #f8f9fa;
						padding: 15px;
						border-radius: 8px;
						font-family: monospace;
					">
						<div><strong>HEX:</strong> <span id="hex-value">#3498db</span></div>
						<div><strong>RGB:</strong> <span id="rgb-value">rgb(52, 152, 219)</span></div>
						<div><strong>HSL:</strong> <span id="hsl-value">hsl(204, 70%, 53%)</span></div>
					</div>

					<div style="
						display: grid;
						grid-template-columns: repeat(6, 1fr);
						gap: 10px;
					" id="color-palette">
						<!-- Color swatches will be added here -->
					</div>
				</div>
			</div>
		`;

		this.setupColorPicker();
	}

	private setupColorPicker(): void {
		const colorInput = this.container?.querySelector('#color-input') as HTMLInputElement;
		const hexValue = this.container?.querySelector('#hex-value') as HTMLElement;
		const rgbValue = this.container?.querySelector('#rgb-value') as HTMLElement;
		const hslValue = this.container?.querySelector('#hsl-value') as HTMLElement;
		const palette = this.container?.querySelector('#color-palette') as HTMLElement;

		if (!colorInput || !hexValue || !rgbValue || !hslValue || !palette) return;

		// Add predefined color swatches
		const colors = [
			'#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD',
			'#FF7675', '#74B9FF', '#00B894', '#FDCB6E', '#E17055', '#A29BFE',
			'#FD79A8', '#6C5CE7', '#00CEC9', '#55A3FF', '#FF9F43', '#FF6348'
		];

		colors.forEach(color => {
			const swatch = document.createElement('div');
			swatch.style.cssText = `
				width: 40px;
				height: 40px;
				background: ${color};
				border-radius: 6px;
				cursor: pointer;
				border: 2px solid transparent;
				transition: all 0.2s;
			`;

			swatch.addEventListener('mouseenter', () => {
				swatch.style.transform = 'scale(1.1)';
				swatch.style.borderColor = '#333';
			});

			swatch.addEventListener('mouseleave', () => {
				swatch.style.transform = 'scale(1)';
				swatch.style.borderColor = 'transparent';
			});

			swatch.addEventListener('click', () => {
				colorInput.value = color;
				this.updateColorInfo(color, hexValue, rgbValue, hslValue);
			});

			palette.appendChild(swatch);
		});

		colorInput.addEventListener('input', () => {
			this.updateColorInfo(colorInput.value, hexValue, rgbValue, hslValue);
		});
	}

	private updateColorInfo(hex: string, hexEl: HTMLElement, rgbEl: HTMLElement, hslEl: HTMLElement): void {
		hexEl.textContent = hex.toUpperCase();

		// Convert hex to RGB
		const r = parseInt(hex.slice(1, 3), 16);
		const g = parseInt(hex.slice(3, 5), 16);
		const b = parseInt(hex.slice(5, 7), 16);
		rgbEl.textContent = `rgb(${r}, ${g}, ${b})`;

		// Convert RGB to HSL
		const { h, s, l } = this.rgbToHsl(r, g, b);
		hslEl.textContent = `hsl(${h}, ${s}%, ${l}%)`;
	}

	private rgbToHsl(r: number, g: number, b: number): { h: number, s: number, l: number } {
		r /= 255; g /= 255; b /= 255;
		const max = Math.max(r, g, b), min = Math.min(r, g, b);
		let h = 0, s = 0;
		const l = (max + min) / 2;

		if (max !== min) {
			const d = max - min;
			s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
			switch (max) {
				case r: h = (g - b) / d + (g < b ? 6 : 0); break;
				case g: h = (b - r) / d + 2; break;
				case b: h = (r - g) / d + 4; break;
			}
			h /= 6;
		}

		return {
			h: Math.round(h * 360),
			s: Math.round(s * 100),
			l: Math.round(l * 100)
		};
	}

	getServiceType(): VSCodeServiceType {
		return VSCodeServiceType.Editor; // Placeholder
	}

	getServiceConfig(): IVSCodeServiceConfig {
		return {
			type: VSCodeServiceType.Editor,
			title: 'Color Picker',
			icon: '🎨',
			defaultWidth: 400,
			defaultHeight: 500,
			titleBarColor: '#9b59b6'
		};
	}
}
