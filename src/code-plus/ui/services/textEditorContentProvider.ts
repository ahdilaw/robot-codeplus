/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Robot Inc. 2025.
 *--------------------------------------------------------------------------------------------*/

import { BaseModalContentProvider } from './modalContentProvider.js';
import { VSCodeServiceType, IVSCodeServiceConfig } from './vscodeServiceBridge.js';
import { CodeEditorWidget } from '../../../vs/editor/browser/widget/codeEditor/codeEditorWidget.js';
import { IInstantiationService } from '../../../vs/platform/instantiation/common/instantiation.js';
import { ITextModel } from '../../../vs/editor/common/model.js';
import { IModelService } from '../../../vs/editor/common/services/model.js';
import { ILanguageService } from '../../../vs/editor/common/languages/language.js';
import { URI } from '../../../vs/base/common/uri.js';

/**
 * Content provider for embedding the complete VS Code text editor (CodeEditorWidget) in a modal
 */
export class TextEditorContentProvider extends BaseModalContentProvider {
	private editorWidget: CodeEditorWidget | undefined;
	private model: ITextModel | undefined;
	private editorContainer: HTMLElement | undefined;

	constructor(
		private readonly instantiationService: IInstantiationService,
		private readonly modelService: IModelService,
		private readonly languageService: ILanguageService
	) {
		const config: IVSCodeServiceConfig = {
			type: VSCodeServiceType.Editor,
			title: 'Text Editor',
			icon: '📝',
			defaultWidth: 800,
			defaultHeight: 600,
			titleBarColor: '#27ae60'
		};
		super(VSCodeServiceType.Editor, config);
	}

	async createContent(container: HTMLElement): Promise<void> {
		try {
			this.container = container;
			this.styleContainer(container);

			// Show loading state
			this.showLoading(container, 'Text Editor');

			// Create editor container
			await this.createEditor(container);

		} catch (error) {
			console.error('Failed to create text editor content:', error);
			this.showError(container, 'Failed to load text editor');
		}
	}

	private async createEditor(container: HTMLElement): Promise<void> {
		// Clear loading state
		while (container.firstChild) {
			container.removeChild(container.firstChild);
		}

		// Create editor container
		this.editorContainer = document.createElement('div');
		this.editorContainer.style.cssText = `
			width: 100%;
			height: 100%;
			position: relative;
			overflow: hidden;
		`;

		// Create the CodeEditorWidget with all required services
		this.editorWidget = this.instantiationService.createInstance(
			CodeEditorWidget,
			this.editorContainer,
			{
				// Editor options
				automaticLayout: true,
				fontSize: 14,
				lineNumbers: 'on',
				minimap: { enabled: true },
				wordWrap: 'on',
				scrollBeyondLastLine: false,
				lineNumbersMinChars: 3,
				glyphMargin: false,
				folding: true,
				renderWhitespace: 'selection',
				renderControlCharacters: false,
				mouseWheelZoom: true,
				cursorBlinking: 'blink',
				cursorSmoothCaretAnimation: 'off',
				cursorStyle: 'line',
				fontLigatures: false,
				hideCursorInOverviewRuler: false,
				links: true,
				contextmenu: true,
				mouseWheelScrollSensitivity: 1,
				quickSuggestions: {
					other: true,
					comments: false,
					strings: false
				},
				suggestOnTriggerCharacters: true,
				acceptSuggestionOnEnter: 'on',
				acceptSuggestionOnCommitCharacter: true,
				snippetSuggestions: 'top',
				emptySelectionClipboard: true,
				copyWithSyntaxHighlighting: true
			},
			{
				isSimpleWidget: false,
				contributions: undefined, // Use all default contributions
				telemetryData: {
					target: 'code-plus-modal-editor'
				}
			}
		);

		// Create and set a model for the editor
		await this.createEditorModel();

		// Add editor to container
		container.appendChild(this.editorContainer);

		// Layout the editor
		this.layoutEditor();

		// Set up event handlers
		this.setupEventHandlers();

		// Focus the editor
		this.editorWidget.focus();
	}

	private async createEditorModel(): Promise<void> {
		if (!this.editorWidget) return;

		// Create a unique URI for this editor instance
		const uri = URI.parse(`untitled:code-plus-editor-${Date.now()}.ts`);

		// Create a model with TypeScript language
		const languageId = this.languageService.getLanguageIdByLanguageName('typescript') || 'typescript';

		this.model = this.modelService.createModel(
			this.getDefaultContent(),
			this.languageService.createById(languageId),
			uri
		);

		// Set the model to the editor
		this.editorWidget.setModel(this.model);
	}

	private getDefaultContent(): string {
		return `/**
 * Welcome to Code+ Text Editor
 *
 * This is a full-featured VS Code editor embedded in a modal window.
 * You can write, edit, and work with code just like in the main editor.
 */

interface CodePlusEditor {
	name: string;
	features: string[];
	isAwesome: boolean;
}

class WelcomeMessage {
	private editor: CodePlusEditor;

	constructor() {
		this.editor = {
			name: 'Code+ Modal Editor',
			features: [
				'Syntax highlighting',
				'IntelliSense',
				'Code folding',
				'Find and replace',
				'Multiple cursors',
				'Bracket matching',
				'Auto-completion',
				'Error detection'
			],
			isAwesome: true
		};
	}

	displayWelcome(): void {
		console.log(\`Welcome to \${this.editor.name}!\`);
		console.log('Features available:');
		this.editor.features.forEach(feature => {
			console.log(\`  - \${feature}\`);
		});

		if (this.editor.isAwesome) {
			console.log('🎉 Enjoy coding in your modal editor!');
		}
	}
}

// Create and display welcome message
const welcome = new WelcomeMessage();
welcome.displayWelcome();

// Try editing this code - all VS Code features are available!
`;
	}

	private setupEventHandlers(): void {
		if (!this.editorWidget) return;

		// Handle model content changes
		this.editorWidget.onDidChangeModelContent(() => {
			// You can add auto-save or other logic here
			console.log('Editor content changed');
		});

		// Handle focus events
		this.editorWidget.onDidFocusEditorText(() => {
			console.log('Editor gained focus');
		});

		this.editorWidget.onDidBlurEditorText(() => {
			console.log('Editor lost focus');
		});

		// Handle cursor position changes
		this.editorWidget.onDidChangeCursorPosition((e) => {
			console.log('Cursor position changed:', e.position);
		});
	}

	private layoutEditor(): void {
		if (!this.editorWidget || !this.editorContainer) return;

		// Get container dimensions
		const rect = this.editorContainer.getBoundingClientRect();

		// Layout the editor to fit the container
		this.editorWidget.layout({
			width: rect.width,
			height: rect.height
		});
	}

	private showError(container: HTMLElement, message: string): void {
		// Clear container
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
			font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
		`;

		// Create error icon
		const errorIcon = document.createElement('div');
		errorIcon.style.cssText = 'font-size: 48px; margin-bottom: 16px;';
		errorIcon.textContent = '⚠️';

		// Create error text
		const errorText = document.createElement('p');
		errorText.style.cssText = 'margin: 0; font-size: 16px; text-align: center;';
		errorText.textContent = message;

		// Append elements
		errorDiv.appendChild(errorIcon);
		errorDiv.appendChild(errorText);
		container.appendChild(errorDiv);
	}

	override onResize(width: number, height: number): void {
		super.onResize(width, height);

		// Resize the editor to fit the new dimensions
		if (this.editorWidget && this.editorContainer) {
			// Account for container padding
			const editorWidth = Math.max(0, width - 40); // 20px padding on each side
			const editorHeight = Math.max(0, height - 40); // 20px padding top/bottom

			this.editorWidget.layout({
				width: editorWidth,
				height: editorHeight
			});
		}
	}

	override onFocus(): void {
		if (this.editorWidget) {
			this.editorWidget.focus();
		}
	}

	override onActivate(): void {
		super.onActivate();

		// Ensure editor is properly focused when modal becomes active
		if (this.editorWidget) {
			this.editorWidget.focus();
		}
	}

	override dispose(): void {
		// Clean up the editor widget
		if (this.editorWidget) {
			this.editorWidget.dispose();
			this.editorWidget = undefined;
		}

		// Clean up the model
		if (this.model) {
			this.model.dispose();
			this.model = undefined;
		}

		this.editorContainer = undefined;

		super.dispose();
	}

	override getServiceType(): VSCodeServiceType {
		return VSCodeServiceType.Editor;
	}

	override getServiceConfig(): IVSCodeServiceConfig {
		return this.serviceConfig;
	}

	/**
	 * Get the current editor content
	 */
	getValue(): string {
		return this.editorWidget?.getValue() || '';
	}

	/**
	 * Set the editor content
	 */
	setValue(value: string): void {
		this.editorWidget?.setValue(value);
	}

	/**
	 * Get the editor widget instance for advanced operations
	 */
	getEditorWidget(): CodeEditorWidget | undefined {
		return this.editorWidget;
	}

	/**
	 * Load content from a file or URI
	 */
	async loadContent(uri: URI): Promise<void> {
		if (!this.editorWidget || !this.modelService) return;

		try {
			// Try to get existing model or create new one
			let model = this.modelService.getModel(uri);

			if (!model) {
				// Create new model
				const content = '// Loading content...';
				const languageId = this.languageService.guessLanguageIdByFilepathOrFirstLine(uri) || 'plaintext';
				model = this.modelService.createModel(
					content,
					this.languageService.createById(languageId),
					uri
				);
			}

			// Set the model to the editor
			this.editorWidget.setModel(model);
			this.model = model;

		} catch (error) {
			console.error('Failed to load content:', error);
		}
	}
}
