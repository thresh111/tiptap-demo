import * as React from "react";

// --- Lib ---
import { parseShortcutKeys } from "@/lib/tiptap-utils";

// --- Hooks ---
import { useTiptapEditor } from "@/hooks/use-tiptap-editor";

// --- Mathematics UI ---
import type { MathType, UseMathematicsConfig } from "./use-mathematics";
import { MATH_SHORTCUT_KEYS, useMathematics } from "./use-mathematics";
import { MathDialog } from "./math-dialog";

// --- UI Primitives ---
import type { ButtonProps } from "@/components/tiptap-ui-primitive/button";
import { Button } from "@/components/tiptap-ui-primitive/button";
import { Badge } from "@/components/tiptap-ui-primitive/badge";

export interface MathematicsButtonProps extends Omit<ButtonProps, "type">, UseMathematicsConfig {
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

export function MathShortcutBadge({
  type,
  shortcutKeys = MATH_SHORTCUT_KEYS[type],
}: {
  type: MathType;
  shortcutKeys?: string;
}) {
  return <Badge>{parseShortcutKeys({ shortcutKeys })}</Badge>;
}

/**
 * Button component for inserting mathematics formulas in a Tiptap editor.
 *
 * For custom button implementations, use the `useMathematics` hook instead.
 */
export const MathematicsButton = React.forwardRef<HTMLButtonElement, MathematicsButtonProps>(
  (
    {
      editor: providedEditor,
      type = "inline",
      text,
      hideWhenUnavailable = false,
      onInserted,
      showShortcut = false,
      onClick,
      children,
      ...buttonProps
    },
    ref
  ) => {
    const { editor } = useTiptapEditor(providedEditor);

    const {
      isVisible,
      handleMath,
      label,
      canInsert,
      isActive,
      Icon,
      shortcutKeys,
      dialogOpen,
      setDialogOpen,
      onInserted: hookOnInserted,
    } = useMathematics({
      editor,
      type,
      hideWhenUnavailable,
      onInserted,
    });

    const handleClick = React.useCallback(
      (event: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        handleMath();
      },
      [handleMath, onClick]
    );

    if (!isVisible) {
      return null;
    }

    return (
      <>
        <Button
          type="button"
          disabled={!canInsert}
          data-style="ghost"
          data-active-state={isActive ? "on" : "off"}
          data-disabled={!canInsert}
          role="button"
          tabIndex={-1}
          aria-label={label}
          tooltip={label}
          onClick={handleClick}
          {...buttonProps}
          ref={ref}
        >
          {children ?? (
            <>
              <Icon className="tiptap-button-icon" />
              {text && <span className="tiptap-button-text">{text}</span>}
              {showShortcut && <MathShortcutBadge type={type} shortcutKeys={shortcutKeys} />}
            </>
          )}
        </Button>

        <MathDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          editor={editor}
          type={type}
          onInserted={hookOnInserted}
        />
      </>
    );
  }
);

MathematicsButton.displayName = "MathematicsButton";
