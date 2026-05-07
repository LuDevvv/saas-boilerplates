import { FC } from "react";
import { GripVertical, RotateCcw } from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  arrayMove,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ModalLayout } from "@/layouts/ModalLayout";
import { cn } from "@/utils/classNames";
import { WIDGET_CATALOG, type WidgetId, type WidgetDef } from "../hooks/useDashboardLayout";

interface DashboardCustomizerProps {
  isOpen: boolean;
  onClose: () => void;
  visibility: Record<WidgetId, boolean>;
  widgetOrder: WidgetId[];
  onToggle: (id: WidgetId) => void;
  onReorder: (order: WidgetId[]) => void;
  onReset: () => void;
}

// ─── Toggle switch ────────────────────────────────────────────────────────────

const Toggle: FC<{ checked: boolean; onChange: () => void }> = ({ checked, onChange }) => (
  <button
    role="switch"
    aria-checked={checked}
    onClick={e => { e.stopPropagation(); onChange(); }}
    className={cn(
      "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent",
      "focus:outline-none transition-colors duration-200",
      checked ? "bg-primary" : "bg-gray-200 dark:bg-gray-700"
    )}
  >
    <span className={cn(
      "pointer-events-none block h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200",
      checked ? "translate-x-4" : "translate-x-0"
    )} />
  </button>
);

// ─── Sortable widget item ─────────────────────────────────────────────────────

const SortableWidgetItem: FC<{
  widget: WidgetDef;
  isOn: boolean;
  onToggle: () => void;
}> = ({ widget, isOn, onToggle }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: widget.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const Icon = widget.icon;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-3 p-3.5 rounded-[16px] border",
        "transition-colors duration-150",
        isDragging ? "opacity-50 shadow-lg" : "",
        isOn
          ? "border-[var(--border)] bg-white dark:bg-surface-elevated"
          : "border-dashed border-gray-200 dark:border-white/[0.08] bg-gray-50/60 dark:bg-white/[0.02]"
      )}
    >
      {/* Drag handle */}
      <button
        {...listeners}
        {...attributes}
        className="cursor-grab active:cursor-grabbing p-0.5 rounded text-gray-300 dark:text-gray-600 hover:text-gray-500 dark:hover:text-gray-400 transition-colors touch-none"
        tabIndex={-1}
      >
        <GripVertical className="h-4 w-4" />
      </button>

      {/* Icon */}
      <div className={cn(
        "h-8 w-8 rounded-[10px] flex items-center justify-center shrink-0 transition-opacity",
        widget.iconBg,
        !isOn && "opacity-40"
      )}>
        <Icon className={cn("h-4 w-4", widget.iconColor)} />
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className={cn(
          "text-[13px] font-semibold leading-snug",
          isOn ? "text-fg" : "text-fg-muted"
        )}>
          {widget.label}
        </p>
        <p className="text-[11px] text-fg-muted mt-0.5 leading-snug">
          {widget.description}
        </p>
      </div>

      {/* Visibility toggle */}
      <Toggle checked={isOn} onChange={onToggle} />
    </div>
  );
};

// ─── Main customizer ──────────────────────────────────────────────────────────

export const DashboardCustomizer: FC<DashboardCustomizerProps> = ({
  isOpen,
  onClose,
  visibility,
  widgetOrder,
  onToggle,
  onReorder,
  onReset,
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = widgetOrder.indexOf(active.id as WidgetId);
      const newIndex = widgetOrder.indexOf(over.id as WidgetId);
      onReorder(arrayMove(widgetOrder, oldIndex, newIndex));
    }
  };

  // Ordered catalog (match widgetOrder)
  const orderedCatalog = widgetOrder
    .map(id => WIDGET_CATALOG.find(w => w.id === id))
    .filter(Boolean) as typeof WIDGET_CATALOG;

  return (
    <ModalLayout
      isOpen={isOpen}
      onClose={onClose}
      title="Personalizar inicio"
      description="Arrastra para reordenar. Activa o desactiva secciones."
      variant="drawer-right"
      size="sm"
    >
      <div className="px-4 sm:px-6 py-5 space-y-2">
        {/* Hint */}
        <p className="text-[11px] text-fg-muted flex items-center gap-1.5 mb-4">
          <GripVertical className="h-3.5 w-3.5 shrink-0" />
          Arrastra las secciones para cambiar el orden en tu inicio
        </p>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={widgetOrder} strategy={verticalListSortingStrategy}>
            {orderedCatalog.map(widget => (
              <SortableWidgetItem
                key={widget.id}
                widget={widget}
                isOn={visibility[widget.id] ?? widget.defaultVisible}
                onToggle={() => onToggle(widget.id)}
              />
            ))}
          </SortableContext>
        </DndContext>

        {/* Reset */}
        <div className="pt-4 mt-2 border-t border-border">
          <button
            onClick={onReset}
            className="flex items-center gap-2 text-[12px] text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors py-1"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Restaurar por defecto
          </button>
        </div>
      </div>
    </ModalLayout>
  );
};
