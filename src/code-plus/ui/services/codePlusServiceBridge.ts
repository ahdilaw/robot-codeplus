/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Robot Inc. 2025.
 *--------------------------------------------------------------------------------------------*/

import { IInstantiationService } from '../../../vs/platform/instantiation/common/instantiation.js';
import { IModelService } from '../../../vs/editor/common/services/model.js';
import { ILanguageService } from '../../../vs/editor/common/languages/language.js';
import { ICodeEditorService } from '../../../vs/editor/browser/services/codeEditorService.js';
import { ICommandService } from '../../../vs/platform/commands/common/commands.js';
import { IContextKeyService } from '../../../vs/platform/contextkey/common/contextkey.js';
import { IThemeService } from '../../../vs/platform/theme/common/themeService.js';
import { INotificationService } from '../../../vs/platform/notification/common/notification.js';
import { IKeybindingService } from '../../../vs/platform/keybinding/common/keybinding.js';
import { IContextMenuService } from '../../../vs/platform/contextview/browser/contextView.js';
import { IConfigurationService } from '../../../vs/platform/configuration/common/configuration.js';
import { IViewDescriptorService } from '../../../vs/workbench/common/views.js';
import { IHoverService } from '../../../vs/platform/hover/browser/hover.js';
import { IOpenerService } from '../../../vs/platform/opener/common/opener.js';
import { IMenuService } from '../../../vs/platform/actions/common/actions.js';
import { IAccessibilityService } from '../../../vs/platform/accessibility/common/accessibility.js';
import { ServiceCollection } from '../../../vs/platform/instantiation/common/serviceCollection.js';
// Terminal service imports
import { ITerminalService, ITerminalGroupService, ITerminalConfigurationService } from '../../../vs/workbench/contrib/terminal/browser/terminal.js';
import { ITerminalProfileService, ITerminalProfileResolverService } from '../../../vs/workbench/contrib/terminal/common/terminal.js';

/**
 * Bridge to provide VS Code services to the Code+ modal system
 */
export class CodePlusServiceBridge {
	private static instance: CodePlusServiceBridge | undefined;

	private constructor(
		private readonly instantiationService: IInstantiationService,
		private readonly modelService: IModelService,
		private readonly languageService: ILanguageService,
		private readonly codeEditorService: ICodeEditorService,
		private readonly commandService: ICommandService,
		private readonly contextKeyService: IContextKeyService,
		private readonly themeService: IThemeService,
		private readonly notificationService: INotificationService,
		private readonly keybindingService: IKeybindingService,
		private readonly contextMenuService: IContextMenuService,
		private readonly configurationService: IConfigurationService,
		private readonly viewDescriptorService: IViewDescriptorService,
		private readonly hoverService: IHoverService,
		private readonly openerService: IOpenerService,
		private readonly menuService: IMenuService,
		private readonly accessibilityService: IAccessibilityService
	) {
		// Make services available globally for the modal system
		this.setupGlobalServices();
	}

	/**
	 * Initialize the service bridge with VS Code services
	 */
	static initialize(
		instantiationService: IInstantiationService,
		modelService: IModelService,
		languageService: ILanguageService,
		codeEditorService: ICodeEditorService,
		commandService: ICommandService,
		contextKeyService: IContextKeyService,
		themeService: IThemeService,
		notificationService: INotificationService,
		keybindingService: IKeybindingService,
		contextMenuService: IContextMenuService,
		configurationService: IConfigurationService,
		viewDescriptorService: IViewDescriptorService,
		hoverService: IHoverService,
		openerService: IOpenerService,
		menuService: IMenuService,
		accessibilityService: IAccessibilityService
	): void {
		if (!this.instance) {
			this.instance = new CodePlusServiceBridge(
				instantiationService,
				modelService,
				languageService,
				codeEditorService,
				commandService,
				contextKeyService,
				themeService,
				notificationService,
				keybindingService,
				contextMenuService,
				configurationService,
				viewDescriptorService,
				hoverService,
				openerService,
				menuService,
				accessibilityService
			);
		}
	}

	/**
	 * Public method to ensure terminal services are available
	 * Called when terminal modal is about to be created
	 */
	public static ensureTerminalServices(): void {
		const instance = this.getInstance();
		if (instance) {
			instance.setupTerminalServices();
		}
	}

	/**
	 * Get the singleton instance
	 */
	static getInstance(): CodePlusServiceBridge | undefined {
		return this.instance;
	}

	/**
	 * Set up global access to VS Code services for the modal system
	 */
	private setupGlobalServices(): void {
		// Create a global object to hold VS Code services
		if (!(globalThis as any).vscodeServices) {
			(globalThis as any).vscodeServices = {};
		}

		// Expose core services globally
		(globalThis as any).vscodeServices.instantiationService = this.instantiationService;
		(globalThis as any).vscodeServices.modelService = this.modelService;
		(globalThis as any).vscodeServices.languageService = this.languageService;
		(globalThis as any).vscodeServices.codeEditorService = this.codeEditorService;
		(globalThis as any).vscodeServices.commandService = this.commandService;
		(globalThis as any).vscodeServices.contextKeyService = this.contextKeyService;
		(globalThis as any).vscodeServices.themeService = this.themeService;
		(globalThis as any).vscodeServices.notificationService = this.notificationService;

		// Expose additional services needed for terminal and other complex components
		(globalThis as any).vscodeServices.keybindingService = this.keybindingService;
		(globalThis as any).vscodeServices.contextMenuService = this.contextMenuService;
		(globalThis as any).vscodeServices.configurationService = this.configurationService;
		(globalThis as any).vscodeServices.viewDescriptorService = this.viewDescriptorService;
		(globalThis as any).vscodeServices.hoverService = this.hoverService;
		(globalThis as any).vscodeServices.openerService = this.openerService;
		(globalThis as any).vscodeServices.menuService = this.menuService;
		(globalThis as any).vscodeServices.accessibilityService = this.accessibilityService;

		// Set up terminal services (may not be available immediately)
		this.setupTerminalServices();

		// Try to set up terminal services again after a delay to handle async initialization
		setTimeout(() => {
			this.setupTerminalServices();
		}, 1000);

		console.log('CodePlusServiceBridge: VS Code services are now available globally');
	}

	/**
	 * Set up terminal services using the instantiation service
	 */
	private setupTerminalServices(): void {
		try {
			// Get terminal services from the instantiation service using proper service identifiers
			const terminalService = this.instantiationService.invokeFunction(accessor => {
				try {
					return accessor.get(ITerminalService);
				} catch {
					return null;
				}
			});

			const terminalGroupService = this.instantiationService.invokeFunction(accessor => {
				try {
					return accessor.get(ITerminalGroupService);
				} catch {
					return null;
				}
			});

			const terminalConfigurationService = this.instantiationService.invokeFunction(accessor => {
				try {
					return accessor.get(ITerminalConfigurationService);
				} catch {
					return null;
				}
			});

			const terminalProfileService = this.instantiationService.invokeFunction(accessor => {
				try {
					return accessor.get(ITerminalProfileService);
				} catch {
					return null;
				}
			});

			const terminalProfileResolverService = this.instantiationService.invokeFunction(accessor => {
				try {
					return accessor.get(ITerminalProfileResolverService);
				} catch {
					return null;
				}
			});

			// Expose terminal services if available
			if (terminalService) {
				(globalThis as any).vscodeServices.terminalService = terminalService;
				console.log('CodePlusServiceBridge: Terminal service registered');
			} else {
				console.warn('CodePlusServiceBridge: Terminal service not available');
			}

			if (terminalGroupService) {
				(globalThis as any).vscodeServices.terminalGroupService = terminalGroupService;
				console.log('CodePlusServiceBridge: Terminal group service registered');
			} else {
				console.warn('CodePlusServiceBridge: Terminal group service not available');
			}

			if (terminalConfigurationService) {
				(globalThis as any).vscodeServices.terminalConfigurationService = terminalConfigurationService;
				console.log('CodePlusServiceBridge: Terminal configuration service registered');
			} else {
				console.warn('CodePlusServiceBridge: Terminal configuration service not available');
			}

			if (terminalProfileService) {
				(globalThis as any).vscodeServices.terminalProfileService = terminalProfileService;
				console.log('CodePlusServiceBridge: Terminal profile service registered');
			} else {
				console.warn('CodePlusServiceBridge: Terminal profile service not available');
			}

			if (terminalProfileResolverService) {
				(globalThis as any).vscodeServices.terminalProfileResolverService = terminalProfileResolverService;
				console.log('CodePlusServiceBridge: Terminal profile resolver service registered');
			} else {
				console.warn('CodePlusServiceBridge: Terminal profile resolver service not available');
			}
		} catch (error) {
			console.warn('Failed to initialize terminal services:', error);
		}
	}

	/**
	 * Get the instantiation service
	 */
	getInstantiationService(): IInstantiationService {
		return this.instantiationService;
	}

	/**
	 * Get the model service
	 */
	getModelService(): IModelService {
		return this.modelService;
	}

	/**
	 * Get the language service
	 */
	getLanguageService(): ILanguageService {
		return this.languageService;
	}

	/**
	 * Get the code editor service
	 */
	getCodeEditorService(): ICodeEditorService {
		return this.codeEditorService;
	}

	/**
	 * Get the command service
	 */
	getCommandService(): ICommandService {
		return this.commandService;
	}

	/**
	 * Get the context key service
	 */
	getContextKeyService(): IContextKeyService {
		return this.contextKeyService;
	}

	/**
	 * Get the theme service
	 */
	getThemeService(): IThemeService {
		return this.themeService;
	}

	/**
	 * Get the notification service
	 */
	getNotificationService(): INotificationService {
		return this.notificationService;
	}

	/**
	 * Create a scoped instantiation service for modals
	 */
	createScopedInstantiationService(): IInstantiationService {
		return this.instantiationService.createChild(new ServiceCollection());
	}

	/**
	 * Create a scoped context key service for modals
	 */
	createScopedContextKeyService(domElement?: HTMLElement): IContextKeyService {
		return domElement ? this.contextKeyService.createScoped(domElement) : this.contextKeyService;
	}

	/**
	 * Clean up resources
	 */
	dispose(): void {
		// Clean up global services
		if ((globalThis as any).vscodeServices) {
			delete (globalThis as any).vscodeServices;
		}

		CodePlusServiceBridge.instance = undefined;
	}
}
