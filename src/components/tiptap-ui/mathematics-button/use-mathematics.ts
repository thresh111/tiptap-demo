"use client";

import * as React from "react";
import { useHotkeys } from "react-hotkeys-hook";
import type { Editor } from "@tiptap/react";

// --- Hooks ---
import { useTiptapEditor } from "@/hooks/use-tiptap-editor";
import { useIsMobile } from "@/hooks/use-mobile";

// --- Icons ---
import { MathematicsIcon } from "@/components/tiptap-icons/mathematics-icon";

export type MathType = "inline" | "block";

/**
 * Configuration for the mathematics functionality
 */
export interface UseMathematicsConfig {
  /**
   * The Tiptap editor instance.
   */
  editor?: Editor | null;
  /**
   * The type of math to insert
   * @default "inline"
   */
  type?: MathType;
  /**
   * Whether the button should hide when mathematics is not available.
   * @default false
   */
  hideWhenUnavailable?: boolean;
  /**
   * Callback function called after a successful math insertion.
   */
  onInserted?: () => void;
}

export const MATH_SHORTCUT_KEYS: Record<MathType, string> = {
  inline: "mod+shift+m",
  block: "mod+shift+alt+m",
};

/**
 * Checks if mathematics commands are available in the current editor state
 */
export function canInsertMath(editor: Editor | null): boolean {
  if (!editor || !editor.isEditable) return false;
  return true;
}

/**
 * Checks if a math node is currently selected
 */
export function isMathActive(editor: Editor | null, type: MathType): boolean {
  if (!editor || !editor.isEditable) return false;

  try {
    if (type === "inline") {
      return editor.isActive("inlineMath");
    } else {
      return editor.isActive("blockMath");
    }
  } catch (error) {
    return false;
  }
}

/**
 * Inserts math formula in the editor
 */
export function insertMath(editor: Editor | null, type: MathType, latex?: string): boolean {
  if (!editor || !editor.isEditable) return false;

  const defaultLatex = latex || (type === "inline" ? "x^2" : "\\frac{a}{b}");

  try {
    if (type === "inline") {
      return editor.chain().focus().insertInlineMath({ latex: defaultLatex }).run();
    } else {
      return editor.chain().focus().insertBlockMath({ latex: defaultLatex }).run();
    }
  } catch (error) {
    console.error("Failed to insert math:", error);
    return false;
  }
}

/**
 * Determines if the mathematics button should be shown
 */
export function shouldShowMathButton(props: {
  editor: Editor | null;
  type: MathType;
  hideWhenUnavailable: boolean;
}): boolean {
  const { editor, hideWhenUnavailable } = props;

  if (!editor || !editor.isEditable) return false;

  // Check if the mathematics extension is available
  const extensionNames = editor.extensionManager.extensions.map((ext) => ext.name);
  console.log("Available extensions:", extensionNames); // Debug log

  const hasMathematicsExtension = editor.extensionManager.extensions.some(
    (ext) => ext.name === "mathematics" || ext.name === "inlineMath" || ext.name === "blockMath"
  );

  // Alternative check: try to see if commands are available
  if (!hasMathematicsExtension) {
    try {
      const hasInlineCommand = typeof editor.commands.insertInlineMath === "function";
      const hasBlockCommand = typeof editor.commands.insertBlockMath === "function";
      console.log("Has inline command:", hasInlineCommand, "Has block command:", hasBlockCommand);

      if (!hasInlineCommand && !hasBlockCommand) {
        return false;
      }
    } catch (error) {
      console.warn("Error checking math commands:", error);
      return false;
    }
  }

  if (hideWhenUnavailable) {
    return canInsertMath(editor);
  }

  return true;
}

/**
 * Gets the formatted math type name
 */
export function getFormattedMathName(type: MathType): string {
  return type === "inline" ? "Inline Math" : "Block Math";
}

/**
 * Opens math dialog for LaTeX input
 */
export function openMathDialog(setDialogOpen: (open: boolean) => void): void {
  setDialogOpen(true);
}

export function useMathematics(config: UseMathematicsConfig) {
  const { editor: providedEditor, type = "inline", hideWhenUnavailable = false, onInserted } = config;

  const { editor } = useTiptapEditor(providedEditor);
  const isMobile = useIsMobile();
  const [isVisible, setIsVisible] = React.useState<boolean>(true);
  const [dialogOpen, setDialogOpen] = React.useState<boolean>(false);
  const canInsert = canInsertMath(editor);
  const isActive = isMathActive(editor, type);

  // Debug logs
  React.useEffect(() => {
    if (editor) {
      console.log("Editor instance:", editor);
      console.log(
        "Editor extensions:",
        editor.extensionManager.extensions.map((ext) => ext.name)
      );
      console.log("Can insert math:", canInsert);
      console.log("Is visible:", isVisible);
    }
  }, [editor, canInsert, isVisible]);

  React.useEffect(() => {
    if (!editor) return;

    const handleSelectionUpdate = () => {
      setIsVisible(shouldShowMathButton({ editor, type, hideWhenUnavailable }));
    };

    handleSelectionUpdate();

    editor.on("selectionUpdate", handleSelectionUpdate);

    return () => {
      editor.off("selectionUpdate", handleSelectionUpdate);
    };
  }, [editor, type, hideWhenUnavailable]);

  const handleMath = React.useCallback(() => {
    if (!editor) return false;
    setDialogOpen(true);
    return true;
  }, [editor]);

  useHotkeys(
    MATH_SHORTCUT_KEYS[type],
    (event) => {
      event.preventDefault();
      handleMath();
    },
    {
      enabled: isVisible && canInsert,
      enableOnContentEditable: !isMobile,
      enableOnFormTags: true,
    }
  );

  return {
    isVisible,
    isActive,
    handleMath,
    canInsert,
    label: getFormattedMathName(type),
    shortcutKeys: MATH_SHORTCUT_KEYS[type],
    Icon: MathematicsIcon,
    dialogOpen,
    setDialogOpen,
    onInserted,
  };
}
