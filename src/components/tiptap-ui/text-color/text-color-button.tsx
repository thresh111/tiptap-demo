"use client";

import * as React from "react";

// --- Lib ---
import { parseShortcutKeys } from "@/lib/tiptap-utils";

// --- Hooks ---
import { useTiptapEditor } from "@/hooks/use-tiptap-editor";

// --- Tiptap UI ---
import type { UseTextColorConfig } from "@/components/tiptap-ui/text-color";
import { TEXT_COLOR_SHORTCUT_KEY, useTextColor } from "@/components/tiptap-ui/text-color";

// --- UI Primitives ---
import type { ButtonProps } from "@/components/tiptap-ui-primitive/button";
import { Button } from "@/components/tiptap-ui-primitive/button";
import { Badge } from "@/components/tiptap-ui-primitive/badge";

// --- Styles ---
import "@/components/tiptap-ui/text-color/text-color-button.scss";

export interface TextColorButtonProps extends Omit<ButtonProps, "type">, UseTextColorConfig {
  /**
   * Optional text to display alongside the icon.
   */
  text?: string;
  /**
   * Optional show shortcut keys in the button.
   * @default false
   */
  showShortcut?: boolean;
}

export function TextColorShortcutBadge({ shortcutKeys = TEXT_COLOR_SHORTCUT_KEY }: { shortcutKeys?: string }) {
  return <Badge>{parseShortcutKeys({ shortcutKeys })}</Badge>;
}

/**
 * Button component for applying text color in a Tiptap editor.
 *
 * For custom button implementations, use the `useTextColor` hook instead.
 */
export const TextColorButton = React.forwardRef<HTMLButtonElement, TextColorButtonProps>(
  (
    {
      editor: providedEditor,
      textColor,
      text,
      hideWhenUnavailable = false,
      onApplied,
      showShortcut = false,
      onClick,
      children,
      style,
      ...buttonProps
    },
    ref
  ) => {
    const { editor } = useTiptapEditor(providedEditor);
    const { isVisible, canTextColor, isActive, handleTextColor, label, shortcutKeys } = useTextColor({
      editor,
      textColor,
      label: text || `Toggle text color (${textColor})`,
      hideWhenUnavailable,
      onApplied,
    });

    const handleClick = React.useCallback(
      (event: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        handleTextColor();
      },
      [handleTextColor, onClick]
    );

    const buttonStyle = React.useMemo(
      () =>
        ({
          ...style,
          "--text-color": textColor,
        } as React.CSSProperties),
      [textColor, style]
    );

    if (!isVisible) {
      return null;
    }

    return (
      <Button
        type="button"
        data-style="ghost"
        data-active-state={isActive ? "on" : "off"}
        role="button"
        tabIndex={-1}
        disabled={!canTextColor}
        data-disabled={!canTextColor}
        aria-label={label}
        aria-pressed={isActive}
        tooltip={label}
        onClick={handleClick}
        style={buttonStyle}
        {...buttonProps}
        ref={ref}
      >
        {children ?? (
          <>
            <span className="tiptap-button-text-color" style={{ "--text-color": textColor } as React.CSSProperties} />
            {text && <span className="tiptap-button-text">{text}</span>}
            {showShortcut && <TextColorShortcutBadge shortcutKeys={shortcutKeys} />}
          </>
        )}
      </Button>
    );
  }
);

TextColorButton.displayName = "TextColorButton";
