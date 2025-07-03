/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Robot Inc. 2025.
 *--------------------------------------------------------------------------------------------*/

import { UI_CONSTANTS, CSS_CLASSES, MODAL_ICONS } from './constants.js';

/**
 * DOM utility functions for consistent element creation and styling
 */
export class DOMUtils {
	/**
	 * Clear all children from a container safely
	 */
	static clearContainer(container: HTMLElement): void {
		while (container.firstChild) {
			container.removeChild(container.firstChild);
		}
	}

	/**
	 * Create an element with consistent styling
	 */
	static createElement(tag: string, className?: string, styles?: string): HTMLElement {
		const element = document.createElement(tag);
		if (className) {
			element.className = className;
		}
		if (styles) {
			element.style.cssText = styles;
		}
		return element;
	}

	/**
	 * Create a button with hover effects
	 */
	static createButton(
		text: string,
		onClick: () => void,
		baseStyles: string,
		hoverStyles?: { background?: string; color?: string }
	): HTMLElement {
		const button = this.createElement('div', undefined, baseStyles);
		button.textContent = text;
		button.style.cursor = 'pointer';
		button.style.transition = `all ${UI_CONSTANTS.ANIMATION.HOVER_TRANSITION}ms ease`;

		const originalStyles = {
			background: button.style.backgroundColor,
			color: button.style.color
		};

		if (hoverStyles) {
			button.addEventListener('mouseenter', () => {
				if (hoverStyles.background) button.style.backgroundColor = hoverStyles.background;
				if (hoverStyles.color) button.style.color = hoverStyles.color;
			});

			button.addEventListener('mouseleave', () => {
				button.style.backgroundColor = originalStyles.background;
				button.style.color = originalStyles.color;
			});
		}

		button.addEventListener('click', onClick);
		return button;
	}

	/**
	 * Apply animation to an element
	 */
	static animate(
		element: HTMLElement,
		properties: Record<string, string>,
		duration: number = UI_CONSTANTS.ANIMATION.NORMAL,
		easing: string = 'ease'
	): Promise<void> {
		return new Promise((resolve) => {
			element.style.transition = `all ${duration}ms ${easing}`;

			Object.entries(properties).forEach(([prop, value]) => {
				(element.style as any)[prop] = value;
			});

			setTimeout(() => {
				element.style.transition = '';
				resolve();
			}, duration);
		});
	}

	/**
	 * Get modal icon based on title
	 */
	static getModalIcon(title: string): string {
		const lowerTitle = title.toLowerCase();
		for (const [key, icon] of Object.entries(MODAL_ICONS)) {
			if (lowerTitle.includes(key)) {
				return icon;
			}
		}
		return MODAL_ICONS.default;
	}

	/**
	 * Calculate random position for new modal
	 */
	static calculateRandomModalPosition(width: number, height: number): { left: number; top: number } {
		const maxLeft = Math.max(50, window.innerWidth - width - 50);
		const maxTop = Math.max(50, window.innerHeight - height - 100);

		return {
			left: Math.random() * maxLeft + 50,
			top: Math.random() * maxTop + 50
		};
	}

	/**
	 * Find the content area element
	 */
	static getContentArea(): HTMLElement | null {
		return document.querySelector(`.${CSS_CLASSES.CONTENT_AREA}`);
	}

	/**
	 * Find all modal elements
	 */
	static getAllModals(): NodeListOf<HTMLElement> {
		const contentArea = this.getContentArea();
		return contentArea?.querySelectorAll('[data-dialog-title]') as NodeListOf<HTMLElement> || document.querySelectorAll('[data-dialog-title]');
	}

	/**
	 * Find modal by title
	 */
	static getModalByTitle(title: string): HTMLElement | null {
		const contentArea = this.getContentArea();
		return contentArea?.querySelector(`[data-dialog-title="${title}"]`) as HTMLElement || null;
	}
}

/**
 * Event utility functions
 */
export class EventUtils {
	/**
	 * Create a custom event with proper typing
	 */
	static createCustomEvent<T = any>(type: string, detail?: T): CustomEvent<T> {
		return new CustomEvent(type, { detail, bubbles: true });
	}

	/**
	 * Debounce function calls
	 */
	static debounce<T extends (...args: any[]) => any>(
		func: T,
		delay: number
	): (...args: Parameters<T>) => void {
		let timeoutId: ReturnType<typeof setTimeout>;
		return (...args: Parameters<T>) => {
			clearTimeout(timeoutId);
			timeoutId = setTimeout(() => func.apply(null, args), delay);
		};
	}

	/**
	 * Throttle function calls
	 */
	static throttle<T extends (...args: any[]) => any>(
		func: T,
		delay: number
	): (...args: Parameters<T>) => void {
		let inThrottle = false;
		return (...args: Parameters<T>) => {
			if (!inThrottle) {
				func.apply(null, args);
				inThrottle = true;
				setTimeout(() => inThrottle = false, delay);
			}
		};
	}
}
