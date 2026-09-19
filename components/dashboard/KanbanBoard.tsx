"use client";

import { DragDropContext, Draggable, Droppable, type DropResult } from "@hello-pangea/dnd";
import { motion } from "framer-motion";
import { CalendarClock, GripVertical } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useApplications, useUpdateApplication } from "@/hooks/use-applications";
import { StatusBadge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatCurrencyRange, formatDateShort } from "@/lib/utils";
import type { Application, Status } from "@/types/app";
import { statuses, statusLabels } from "@/types/app";

export function KanbanBoard({ initialApplications }: { initialApplications: Application[] }) {
  const { data: applications = [] } = useApplications(initialApplications);
  const updateApplication = useUpdateApplication();
  // Announced to screen readers after each move (see the aria-live region below).
  const [announcement, setAnnouncement] = useState("");

  const columns = useMemo(() => {
    return statuses.reduce<Record<Status, Application[]>>((acc, status) => {
      acc[status] = applications.filter((app) => app.status === status);
      return acc;
    }, {} as Record<Status, Application[]>);
  }, [applications]);

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const id = result.draggableId;
    const nextStatus = result.destination.droppableId as Status;
    const current = applications.find((app) => app.id === id);
    if (!current || current.status === nextStatus) return;

    // The hook applies the optimistic move to the cache and rolls back on error.
    updateApplication.mutate(
      { id, payload: { status: nextStatus }, optimisticStatus: nextStatus },
      {
        onSuccess: () => {
          const message = `${current.company} moved to ${statusLabels[nextStatus]}`;
          toast.success(message);
          setAnnouncement(`${message}.`);
        },
        onError: () => toast.error("Status update failed — the card was moved back.")
      }
    );
  };

  return (
    <div className="space-y-6">
      {/* Polite live region: announces status moves without stealing focus. */}
      <div aria-live="polite" className="sr-only" role="status">
        {announcement}
      </div>

      <div>
        <p className="text-sm font-medium text-brand">Kanban</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.02em]">Application pipeline</h1>
        <p className="mt-2 text-sm text-slate-400 light:text-slate-600">Drag roles as decisions happen. The timeline updates in the background.</p>
        <p className="mt-2 text-xs text-slate-500 lg:hidden">Swipe horizontally to review every stage.</p>
      </div>

      {!applications.length ? (
        <EmptyState
          title="Your board is ready"
          description="Add applications first, then drag cards across each stage as interviews, offers, and rejections happen."
        />
      ) : null}

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex snap-x gap-4 overflow-x-auto pb-4 lg:grid lg:snap-none lg:grid-cols-6">
          {statuses.map((status) => (
            <Droppable droppableId={status} key={status}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="min-h-[34rem] min-w-[18.25rem] snap-start rounded-lg border border-white/10 bg-white/[0.035] p-3 transition light:border-slate-200 light:bg-white lg:min-w-0"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <div className="text-sm font-medium">{statusLabels[status]}</div>
                    <span className="text-xs text-slate-500">{columns[status].length}</span>
                  </div>
                  <div className={snapshot.isDraggingOver ? "rounded-md bg-brand/5 p-1 transition" : "p-1"}>
                    {columns[status].length ? columns[status].map((application, index) => (
                      <Draggable key={application.id} draggableId={application.id} index={index}>
                        {(dragProvided, dragSnapshot) => (
                          <div
                            ref={dragProvided.innerRef}
                            {...dragProvided.draggableProps}
                            {...dragProvided.dragHandleProps}
                            className="mb-3"
                          >
                            <motion.div layout animate={{ scale: dragSnapshot.isDragging ? 1.03 : 1 }}>
                              <Card className="p-4 transition duration-200 hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.065]">
                                <div className="mb-3 flex items-start justify-between gap-3">
                                  <div className="min-w-0">
                                    <div className="truncate text-sm font-semibold">{application.company}</div>
                                    <div className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">{application.role}</div>
                                  </div>
                                  <GripVertical className="h-4 w-4 shrink-0 text-slate-600" />
                                </div>
                                <StatusBadge status={application.status} />
                                <div className="mt-4 space-y-2 text-xs text-slate-500">
                                  <div className="flex items-center gap-2">
                                    <CalendarClock className="h-3.5 w-3.5" />
                                    {formatDateShort(application.deadline)}
                                  </div>
                                  <div>{formatCurrencyRange(application.salaryMin, application.salaryMax)}</div>
                                  {application.resume ? <div className="truncate text-brand">{application.resume.title}</div> : null}
                                </div>
                              </Card>
                            </motion.div>
                          </div>
                        )}
                      </Draggable>
                    )) : (
                      <div className="rounded-md border border-dashed border-white/10 bg-white/[0.025] p-4 text-xs leading-5 text-slate-500 light:border-slate-200 light:bg-slate-50">
                        No roles here yet.
                      </div>
                    )}
                    {provided.placeholder}
                  </div>
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}
