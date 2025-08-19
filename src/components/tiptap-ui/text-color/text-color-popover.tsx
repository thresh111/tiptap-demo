import * as React from "react";
import { type Editor } from "@tiptap/react";

// --- Hooks ---
import { useMenuNavigation } from "@/hooks/use-menu-navigation";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTiptapEditor } from "@/hooks/use-tiptap-editor";

// --- Icons ---
import { BaselineIcon } from "lucide-react";
import { BanIcon } from "@/components/tiptap-icons/ban-icon";

// --- UI Primitives ---
import { Button } from "@/components/tiptap-ui-primitive/button";
import type { ButtonProps } from "@/components/tiptap-ui-primitive/button";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/tiptap-ui-primitive/popover";

// --- Tiptap UI ---
import type { TextColor, UseTextColorConfig } from "@/components/tiptap-ui/text-color";
import { useTextColor } from "@/components/tiptap-ui/text-color";
import { SketchPicker, type ColorResult } from "react-color";

export interface TextColorPopoverContentProps {
  /**
   * The Tiptap editor instance.
   */
  editor?: Editor | null;
}

export interface TextColorPopoverProps
  extends Omit<ButtonProps, "type">,
    Pick<UseTextColorConfig, "editor" | "hideWhenUnavailable" | "onApplied"> {
  /**
   * Optional colors to use in the text color popover.
   * If not provided, defaults to a predefined set of colors.
   */
  colors?: TextColor[];
}

export const TextColorPopoverButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, children, ...props }, ref) => (
    <Button
      type="button"
      className={className}
      data-style="ghost"
      data-appearance="default"
      role="button"
      tabIndex={-1}
      aria-label="Text color"
      tooltip="Text Color"
      ref={ref}
      {...props}
    >
      {children ?? <BaselineIcon className="tiptap-button-icon" />}
    </Button>
  )
);

TextColorPopoverButton.displayName = "TextColorPopoverButton";

export function TextColorPopoverContent({ editor }: TextColorPopoverContentProps) {
  const { handleRemoveTextColor } = useTextColor({ editor });

  const containerRef = React.useRef<HTMLDivElement>(null);

  return (
    <div ref={containerRef} style={{ position: "relative" }}>
      <SketchPicker
        color={editor?.getAttributes("textStyle")?.color || "#000000"}
        onChange={(color: ColorResult) => {
          editor?.chain().focus().setMark("textStyle", { color: color.hex }).run();
        }}
      />
      <div
        className="absolute bottom-[2%] right-2 cursor-pointer p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
        onClick={handleRemoveTextColor}
      >
        <BanIcon className="size-4" />
      </div>
    </div>
  );
}

export function TextColorPopover({
  editor: providedEditor,
  hideWhenUnavailable = false,
  onApplied,
  ...props
}: TextColorPopoverProps) {
  const { editor } = useTiptapEditor(providedEditor);
  const [isOpen, setIsOpen] = React.useState(false);
  const { isVisible, canTextColor, isActive, label, Icon } = useTextColor({
    editor,
    hideWhenUnavailable,
    onApplied,
  });

  if (!isVisible) return null;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen} modal={true}>
      <PopoverTrigger asChild>
        <TextColorPopoverButton
          disabled={!canTextColor}
          data-active-state={isActive ? "on" : "off"}
          data-disabled={!canTextColor}
          aria-pressed={isActive}
          aria-label={label}
          tooltip={label}
          {...props}
        >
          <Icon className="tiptap-button-icon" />
        </TextColorPopoverButton>
      </PopoverTrigger>
      <PopoverContent aria-label="Text colors">
        <TextColorPopoverContent editor={editor} />
      </PopoverContent>
    </Popover>
  );
}

export default TextColorPopover;
