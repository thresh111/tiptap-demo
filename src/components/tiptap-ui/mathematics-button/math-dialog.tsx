import * as React from "react";
import { Editor } from "@tiptap/react";

// --- Shadcn UI Components ---
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

import katex from "katex";
import "katex/dist/katex.min.css";

// --- Math Utils ---
import { insertMath, type MathType } from "./use-mathematics";

interface MathDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editor: Editor | null;
  type: MathType;

  mode?: "insert" | "update";
  initialLatex?: string;
  pos?: number;

  onInserted?: () => void;
  onUpdated?: () => void;
}

export function MathDialog({
  open,
  onOpenChange,
  editor,
  type,
  mode = "insert",
  initialLatex,
  pos,
  onInserted,
  onUpdated,
}: MathDialogProps) {
  const [isInserting, setIsInserting] = React.useState(false);

  const previewRef = React.useRef<HTMLDivElement>(null);

  const isUpdate = mode === "update";

  // 根据类型设置默认值和示例
  const defaultLatex = type === "inline" ? "x^2" : "\\frac{a}{b}";
  const exampleLatex =
    type === "inline"
      ? "x^2, \\alpha, \\sum_{i=1}^n"
      : "\\frac{a}{b}, \\int_0^1, \\begin{matrix} a & b \\\\ c & d \\end{matrix}";
  const title = isUpdate
    ? type === "inline"
      ? "更新行内数学公式"
      : "更新块级数学公式"
    : type === "inline"
    ? "插入行内数学公式"
    : "插入块级数学公式";
  const description = isUpdate
    ? "编辑并更新当前选中的数学公式"
    : type === "inline"
    ? "输入 LaTeX 代码来插入行内数学公式"
    : "输入 LaTeX 代码来插入块级数学公式";

  const [latex, setLatex] = React.useState(initialLatex ?? defaultLatex);
  const [error, setError] = React.useState("");

  // 重置表单状态
  React.useEffect(() => {
    if (open) {
      setLatex(isUpdate ? initialLatex ?? defaultLatex : defaultLatex);
      setError("");
      setIsInserting(false);
    }
  }, [open, defaultLatex, isUpdate, initialLatex]);

  const checkMathAvailability = React.useCallback(() => {
    if (!editor || !editor.isEditable) {
      return "编辑器不可用";
    }

    if (isUpdate) {
      const updateCmd = type === "inline" ? "updateInlineMath" : "updateBlockMath";
      if (typeof (editor.commands as any)[updateCmd] !== "function") {
        return `数学公式更新功能不可用：缺少 ${updateCmd} 命令，请确认数学扩展已经正确配置。`;
      }
      return null;
    }

    const insertCmd = type === "inline" ? "insertInlineMath" : "insertBlockMath";
    if (typeof (editor.commands as any)[insertCmd] !== "function") {
      return `数学公式功能不可用：${
        type === "inline" ? "行内" : "块级"
      }数学公式扩展未安装。请确保已正确配置 Tiptap 数学扩展。`;
    }

    return null;
  }, [editor, type, isUpdate]);

  // 提交（插入/更新）
  const handleSubmit = React.useCallback(async () => {
    const availabilityError = checkMathAvailability();
    if (availabilityError) {
      setError(availabilityError);
      return;
    }

    if (!latex.trim()) {
      setError("请输入 LaTeX 代码");
      return;
    }

    setIsInserting(true);
    setError("");

    try {
      let success = false;

      if (isUpdate) {
        const chain = editor?.chain();
        if (!chain) {
          setError("无法更新：编辑器未就绪");
          setIsInserting(false);
          return;
        }

        let c = chain.focus();
        if (typeof pos === "number") {
          c = c.setNodeSelection(pos);
        }

        success =
          type === "inline"
            ? c.updateInlineMath({ latex: latex.trim() }).run()
            : c.updateBlockMath({ latex: latex.trim() }).run();

        if (success) {
          onUpdated?.();
        } else {
          setError("更新数学公式失败，请确认已选中公式或位置有效");
        }
      } else {
        success = insertMath(editor, type, latex.trim());
        if (success) {
          onInserted?.();
        } else {
          setError("插入数学公式失败，请检查 LaTeX 语法是否正确");
        }
      }

      if (success) {
        onOpenChange(false);
      }
    } catch (e) {
      console.error("Submit math failed:", e);
      setError(isUpdate ? "更新数学公式时发生错误" : "插入数学公式时发生错误");
    } finally {
      setIsInserting(false);
    }
  }, [latex, editor, type, isUpdate, onInserted, onUpdated, onOpenChange, checkMathAvailability, pos]);

  // 处理键盘事件
  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit]
  );

  React.useEffect(() => {
    if (!open) return;

    setTimeout(() => {
      katex.render(latex || "", previewRef.current as HTMLElement, {
        throwOnError: false,
        displayMode: type !== "inline",
      });
    }, 0);
  }, [latex, type, open, previewRef]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="latex-input">LaTeX 代码</Label>
            <Input
              id="latex-input"
              placeholder={`输入 LaTeX 代码，例如：${defaultLatex}`}
              value={latex}
              onChange={(e) => setLatex(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
              className="font-mono"
            />
            <p className="text-sm text-muted-foreground">示例：{exampleLatex}</p>
          </div>

          {/* 预览区域 */}
          {latex.trim() && (
            <div className="grid gap-2">
              <Label>预览</Label>
              <div className="p-3 bg-muted rounded-md border">
                <div ref={previewRef} className="text-sm text-muted-foreground" />
                <div className="mt-2 text-xs text-muted-foreground">提示：在编辑器中渲染时会显示为数学公式</div>
              </div>
            </div>
          )}

          {/* 常用公式快捷按钮 */}
          <div className="grid gap-2">
            <Label>常用公式</Label>
            <div className="flex flex-wrap gap-1">
              {(type === "inline"
                ? ["x^2", "\\alpha", "\\beta", "\\gamma", "\\pi", "\\sum", "\\int"]
                : [
                    "\\frac{a}{b}",
                    "\\sqrt{x}",
                    "\\int_0^1",
                    "\\sum_{i=1}^n",
                    "\\begin{matrix} a & b \\\\ c & d \\end{matrix}",
                  ]
              ).map((formula) => (
                <Button
                  key={formula}
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-xs font-mono"
                  onClick={() => setLatex(formula)}
                >
                  {formula}
                </Button>
              ))}
            </div>
          </div>

          {/* 错误提示 */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row">
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              className={"hover:cursor-pointer"}
              onClick={() => onOpenChange(false)}
              disabled={isInserting}
            >
              取消
            </Button>
            <Button
              type="button"
              className={"hover:cursor-pointer"}
              onClick={handleSubmit}
              disabled={isInserting || !latex.trim()}
            >
              {isUpdate ? (isInserting ? "更新中..." : "更新") : isInserting ? "插入中..." : "插入"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
