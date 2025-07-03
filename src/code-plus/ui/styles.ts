/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Robot Inc. 2025.
 *--------------------------------------------------------------------------------------------*/

import { UI_CONSTANTS } from './constants.js';

/**
 * Shared style templates for consistent UI components
 */
export class StyleTemplates {
	/**
	 * Get title bar styles
	 */
	static getTitleBarStyles(): string {
		return `
			height: ${UI_CONSTANTS.TITLE_BAR_HEIGHT}px;
			background: ${UI_CONSTANTS.COLORS.TITLE_BAR_BG};
			backdrop-filter: blur(20px);
			border-bottom: 1px solid rgba(0, 0, 0, 0.1);
			position: relative;
			z-index: ${UI_CONSTANTS.Z_INDEX.TITLE_BAR};
			display: flex;
			align-items: center;
			justify-content: center;
		`;
	}

	/**
	 * Get modal styles
	 */
	static getModalStyles(width: number, height: number, left: number, top: number): string {
		return `
			position: absolute;
			width: ${width}px;
			height: ${height}px;
			left: ${left}px;
			top: ${top}px;
			background: ${UI_CONSTANTS.COLORS.MODAL_BG};
			border: 1px solid ${UI_CONSTANTS.COLORS.MODAL_BORDER};
			border-radius: 8px;
			box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
			display: flex;
			flex-direction: column;
			min-width: ${UI_CONSTANTS.MODAL_MIN_WIDTH}px;
			min-height: ${UI_CONSTANTS.MODAL_MIN_HEIGHT}px;
			z-index: ${UI_CONSTANTS.Z_INDEX.MODAL_BASE};
		`;
	}

	/**
	 * Get dock styles
	 */
	static getDockStyles(): string {
		return `
			position: fixed;
			bottom: ${UI_CONSTANTS.DOCK_BOTTOM_OFFSET}px;
			left: 50%;
			transform: translateX(-50%);
			background: rgba(255, 255, 255, 0.1);
			backdrop-filter: blur(10px);
			border: 1px solid rgba(255, 255, 255, 0.2);
			border-radius: 16px;
			padding: 8px 12px;
			display: flex;
			align-items: center;
			gap: 8px;
			z-index: ${UI_CONSTANTS.Z_INDEX.DOCK};
			box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
			transition: all ${UI_CONSTANTS.ANIMATION.NORMAL}ms ease;
		`;
	}

	/**
	 * Get launchpad styles
	 */
	static getLaunchpadStyles(): string {
		return `
			position: fixed;
			top: 0;
			left: 0;
			width: 100%;
			height: 100%;
			background: rgba(0, 0, 0, 0.8);
			backdrop-filter: blur(20px);
			display: none;
			flex-direction: column;
			align-items: center;
			justify-content: flex-start;
			z-index: ${UI_CONSTANTS.Z_INDEX.LAUNCHPAD};
			padding: 80px 40px 40px 40px;
		`;
	}

	/**
	 * Get button hover styles
	 */
	static getButtonStyles(baseColor?: string, hoverColor?: string): {
		base: string;
		hover: { background?: string; color?: string };
	} {
		return {
			base: `
				cursor: pointer;
				transition: all ${UI_CONSTANTS.ANIMATION.HOVER_TRANSITION}ms ease;
				background: ${baseColor || 'transparent'};
				border: none;
				outline: none;
			`,
			hover: {
				background: hoverColor || 'rgba(0, 0, 0, 0.1)'
			}
		};
	}

	/**
	 * Get text styles
	 */
	static getTextStyles(size: number, weight: number = 400, color?: string): string {
		return `
			font-family: ${UI_CONSTANTS.FONTS.SYSTEM};
			font-size: ${size}px;
			font-weight: ${weight};
			color: ${color || UI_CONSTANTS.COLORS.TEXT_PRIMARY};
		`;
	}

	/**
	 * Get animation styles
	 */
	static getAnimationStyles(duration: number = UI_CONSTANTS.ANIMATION.NORMAL, easing: string = 'ease'): string {
		return `transition: all ${duration}ms ${easing};`;
	}

	/**
	 * Get resize handle styles
	 */
	static getResizeHandleStyles(position: 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw'): string {
		const baseStyles = `
			position: absolute;
			background: transparent;
			z-index: 10;
		`;

		const cursors = {
			n: 'ns-resize',
			s: 'ns-resize',
			e: 'ew-resize',
			w: 'ew-resize',
			ne: 'nesw-resize',
			nw: 'nwse-resize',
			se: 'nwse-resize',
			sw: 'nesw-resize'
		};

		const positions = {
			n: 'top: -2px; left: 2px; right: 2px; height: 4px;',
			s: 'bottom: -2px; left: 2px; right: 2px; height: 4px;',
			e: 'top: 2px; right: -2px; bottom: 2px; width: 4px;',
			w: 'top: 2px; left: -2px; bottom: 2px; width: 4px;',
			ne: 'top: -2px; right: -2px; width: 8px; height: 8px;',
			nw: 'top: -2px; left: -2px; width: 8px; height: 8px;',
			se: 'bottom: -2px; right: -2px; width: 8px; height: 8px;',
			sw: 'bottom: -2px; left: -2px; width: 8px; height: 8px;'
		};

		return `
			${baseStyles}
			cursor: ${cursors[position]};
			${positions[position]}
		`;
	}
}
