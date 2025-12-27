import React, { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import api from "../../services/api";
import Loader from "../../components/common/Loader";
import {
  Clock,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  UserPlus,
} from "lucide-react";
import clsx from "clsx";
import { useAuth } from "../../context/AuthContext";

const KanbanBoard = () => {
  const { user } = useAuth();
  const [columns, setColumns] = useState({
    NEW: { id: "NEW", title: "New Requests", items: [] },
    IN_PROGRESS: { id: "IN_PROGRESS", title: "In Progress", items: [] },
    REPAIRED: { id: "REPAIRED", title: "Repaired", items: [] },
    SCRAP: { id: "SCRAP", title: "Scrap", items: [] },
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const requests = await api.maintenance.getKanban();
        const newColumns = {
          NEW: { id: "NEW", title: "New Requests", items: [] },
          IN_PROGRESS: { id: "IN_PROGRESS", title: "In Progress", items: [] },
          REPAIRED: { id: "REPAIRED", title: "Repaired", items: [] },
          SCRAP: { id: "SCRAP", title: "Scrap", items: [] },
        };

        requests.forEach((req) => {
          // Filter for Technician: Show assigned to me OR unassigned (to pick up)
          // For Admin/Manager: Show all
          if (user.role === "TECHNICIAN") {
            if (req.assignedTo === user.name || !req.assignedTo) {
              if (newColumns[req.status]) {
                newColumns[req.status].items.push(req);
              }
            }
          } else {
            if (newColumns[req.status]) {
              newColumns[req.status].items.push(req);
            }
          }
        });

        setColumns(newColumns);
      } catch (error) {
        console.error("Failed to fetch kanban data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const handleAssignSelf = async (requestId) => {
    try {
      // Optimistic update
      const updatedColumns = { ...columns };
      let foundItem = null;

      Object.keys(updatedColumns).forEach((key) => {
        const itemIndex = updatedColumns[key].items.findIndex(
          (i) => i.id === requestId
        );
        if (itemIndex !== -1) {
          updatedColumns[key].items[itemIndex].assignedTo = user.name;
          foundItem = updatedColumns[key].items[itemIndex];
        }
      });

      setColumns(updatedColumns);
      await api.maintenance.updateStatus(requestId, { assignedTo: user.name });
    } catch (error) {
      console.error("Failed to assign self:", error);
    }
  };

  const onDragEnd = async (result) => {
    if (!result.destination) return;
    const { source, destination } = result;

    // Technician restriction: Can only move if assigned to them (or picking up from NEW?)
    // Let's allow moving if it's in their view, but maybe enforce assignment on move to IN_PROGRESS?

    if (source.droppableId !== destination.droppableId) {
      const sourceColumn = columns[source.droppableId];
      const destColumn = columns[destination.droppableId];
      const sourceItems = [...sourceColumn.items];
      const destItems = [...destColumn.items];
      const [removed] = sourceItems.splice(source.index, 1);

      // If Technician moves to IN_PROGRESS and not assigned, auto-assign
      let newAssignedTo = removed.assignedTo;
      if (
        user.role === "TECHNICIAN" &&
        !removed.assignedTo &&
        destination.droppableId === "IN_PROGRESS"
      ) {
        newAssignedTo = user.name;
      }

      // Optimistic update
      const updatedItem = {
        ...removed,
        status: destination.droppableId,
        assignedTo: newAssignedTo,
      };
      destItems.splice(destination.index, 0, updatedItem);

      setColumns({
        ...columns,
        [source.droppableId]: { ...sourceColumn, items: sourceItems },
        [destination.droppableId]: { ...destColumn, items: destItems },
      });

      try {
        await api.maintenance.updateStatus(removed.id, {
          status: destination.droppableId,
          assignedTo: newAssignedTo,
        });
      } catch (error) {
        console.error("Failed to update status:", error);
      }
    } else {
      const column = columns[source.droppableId];
      const copiedItems = [...column.items];
      const [removed] = copiedItems.splice(source.index, 1);
      copiedItems.splice(destination.index, 0, removed);
      setColumns({
        ...columns,
        [source.droppableId]: { ...column, items: copiedItems },
      });
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="h-full flex flex-col">
      <h1 className="text-3xl font-bold text-white mb-6">Maintenance Board</h1>
      <div className="flex-1 overflow-x-auto">
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex gap-6 h-full min-w-[1000px]">
            {Object.values(columns).map((column) => (
              <div
                key={column.id}
                className="flex-1 flex flex-col bg-slate-900/50 rounded-xl border border-slate-800 min-w-[280px]"
              >
                <div className="p-4 border-b border-slate-800 flex justify-between items-center">
                  <h2 className="font-semibold text-slate-300">
                    {column.title}
                  </h2>
                  <span className="bg-slate-800 text-slate-400 text-xs px-2 py-1 rounded-full">
                    {column.items.length}
                  </span>
                </div>
                <Droppable droppableId={column.id}>
                  {(provided, snapshot) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className={clsx(
                        "flex-1 p-3 space-y-3 transition-colors",
                        snapshot.isDraggingOver ? "bg-slate-800/50" : ""
                      )}
                    >
                      {column.items.map((item, index) => (
                        <Draggable
                          key={item.id}
                          draggableId={item.id.toString()}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={clsx(
                                "bg-slate-800 p-4 rounded-lg border border-slate-700 shadow-sm hover:border-blue-500/50 group transition-all",
                                snapshot.isDragging
                                  ? "shadow-lg ring-2 ring-blue-500 rotate-2"
                                  : ""
                              )}
                              style={provided.draggableProps.style}
                            >
                              <div className="flex justify-between items-start mb-2">
                                <span
                                  className={clsx(
                                    "text-[10px] font-bold px-1.5 py-0.5 rounded border",
                                    item.priority === "CRITICAL"
                                      ? "text-red-500 border-red-500/20 bg-red-500/10"
                                      : item.priority === "HIGH"
                                      ? "text-orange-500 border-orange-500/20 bg-orange-500/10"
                                      : "text-blue-500 border-blue-500/20 bg-blue-500/10"
                                  )}
                                >
                                  {item.priority}
                                </span>
                                <span className="text-xs text-slate-500">
                                  #{item.id}
                                </span>
                              </div>
                              <h4 className="text-white font-medium text-sm mb-1">
                                {item.subject}
                              </h4>
                              <p className="text-slate-400 text-xs mb-3">
                                {item.equipmentName}
                              </p>

                              <div className="flex items-center justify-between pt-3 border-t border-slate-700/50">
                                <div className="flex items-center gap-2">
                                  {item.assignedTo ? (
                                    <div
                                      className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-[10px] text-white font-bold ring-2 ring-slate-800"
                                      title={`Assigned to ${item.assignedTo}`}
                                    >
                                      {item.assignedTo.charAt(0)}
                                    </div>
                                  ) : user.role === "TECHNICIAN" ? (
                                    <button
                                      onClick={() => handleAssignSelf(item.id)}
                                      className="flex items-center gap-1 text-[10px] bg-blue-500/10 text-blue-400 px-2 py-1 rounded hover:bg-blue-500/20 transition-colors"
                                    >
                                      <UserPlus className="w-3 h-3" />
                                      Assign Me
                                    </button>
                                  ) : (
                                    <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-[10px] text-slate-400 ring-2 ring-slate-800">
                                      ?
                                    </div>
                                  )}
                                </div>
                                {item.type === "CORRECTIVE" ? (
                                  <AlertTriangle className="w-4 h-4 text-red-500/50" />
                                ) : (
                                  <Calendar className="w-4 h-4 text-blue-500/50" />
                                )}
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            ))}
          </div>
        </DragDropContext>
      </div>
    </div>
  );
};

export default KanbanBoard;
