import React, { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import api from "../../services/api";
import Loader from "../../components/common/Loader";
import Modal from "../../components/common/Modal";
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

  // Repaired specific state
  const [isRepairedModalOpen, setIsRepairedModalOpen] = useState(false);
  const [pendingRepairedItem, setPendingRepairedItem] = useState(null); // { itemId, source, destination }
  const [durationHours, setDurationHours] = useState("");

  const fetchData = async () => {
    try {
      const requests = await api.maintenance.getKanban();
      console.log("Kanban Raw Data:", requests);
      console.log("User Role:", user?.role);

      const newColumns = {
        NEW: { id: "NEW", title: "New Requests", items: [] },
        IN_PROGRESS: { id: "IN_PROGRESS", title: "In Progress", items: [] },
        REPAIRED: { id: "REPAIRED", title: "Repaired", items: [] },
        SCRAP: { id: "SCRAP", title: "Scrap", items: [] },
      };

      requests.forEach((req) => {
        // Normalize keys (Backend might return snake_case)
        const status = req.status || req.Status; 
        const assignedTo = req.assignedTo || 
                           req.assigned_technician_details?.full_name || 
                           req.assigned_user?.full_name || 
                           req.assigned_to; 

        const equipmentName = req.equipmentName || 
                              req.equipment_details?.name || 
                              req.equipment_name || 
                              (typeof req.equipment === 'object' ? req.equipment.name : `Equipment #${req.equipment}`);
        
        const requestType = req.type || req.request_type;
        const priority = req.priority || (requestType === "CORRECTIVE" ? "HIGH" : "MEDIUM"); // Default priority if missing

        const normalizedReq = { ...req, status, assignedTo, equipmentName, type: requestType, priority };

        console.log(`Processing Req ${req.id}: Status=${status}, Assigned=${assignedTo}`);
        
        // Filter for Technician: Show assigned to me OR unassigned (to pick up)
        // For Admin/Manager: Show all
        if (user.role === "TECHNICIAN") {
          if (
            assignedTo === (user.full_name || user.name) ||
            !assignedTo
          ) {
            if (newColumns[status]) {
              newColumns[status].items.push(normalizedReq);
            } else {
                 console.warn("Unknown status:", status);
            }
          }
        } else {
          if (newColumns[status]) {
            newColumns[status].items.push(normalizedReq);
          } else {
               console.warn("Unknown status:", status);
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

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleAssignSelf = async (requestId) => {
    try {
      // Optimistic update
      const updatedColumns = { ...columns };
      
      Object.keys(updatedColumns).forEach((key) => {
        const itemIndex = updatedColumns[key].items.findIndex(
          (i) => i.id === requestId
        );
        if (itemIndex !== -1) {
          updatedColumns[key].items[itemIndex].assignedTo =
            user.full_name || user.name;
        }
      });

      setColumns(updatedColumns);
      await api.maintenance.updateStatus(requestId, {
        assignedTo: user.full_name || user.name,
      });
    } catch (error) {
      console.error("Failed to assign self:", error);
      fetchData(); // transform back on error
    }
  };

  const moveItem = async (itemId, source, destination, extraData = {}) => {
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
        newAssignedTo = user.full_name || user.name;
      }

      // Optimistic update
      const updatedItem = {
        ...removed,
        status: destination.droppableId,
        assignedTo: newAssignedTo,
        ...extraData
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
          ...extraData
        });
      } catch (error) {
        console.error("Failed to update status:", error);
        fetchData(); // Revert on error
      }
  };

  const onDragEnd = async (result) => {
    if (!result.destination) return;
    const { source, destination, draggableId } = result;

    if (source.droppableId !== destination.droppableId) {
        // Check if moving to REPAIRED
        if (destination.droppableId === "REPAIRED") {
            setPendingRepairedItem({ itemId: draggableId, source, destination });
            setDurationHours(""); // Reset
            setIsRepairedModalOpen(true);
            return;
        }
        
        // Normal move
        await moveItem(draggableId, source, destination);
    } else {
      // Reordering in same column
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

  const handleRepairedConfirm = async (e) => {
      e.preventDefault();
      if(!pendingRepairedItem) return;
      
      const { itemId, source, destination } = pendingRepairedItem;
      await moveItem(itemId, source, destination, { duration_hours: parseFloat(durationHours) });
      
      setIsRepairedModalOpen(false);
      setPendingRepairedItem(null);
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
                                {item.equipmentName || "Equipment #" + item.equipment}
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

       <Modal isOpen={isRepairedModalOpen} onClose={() => setIsRepairedModalOpen(false)} title="Complete Maintenance">
          <form onSubmit={handleRepairedConfirm} className="space-y-4">
              <p className="text-slate-300 text-sm">Please specify how long this repair took to complete.</p>
              <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Duration (Hours)</label>
                  <input 
                    type="number" 
                    step="0.5" 
                    min="0"
                    required 
                    value={durationHours} 
                    onChange={e => setDurationHours(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white" 
                    autoFocus
                  />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                  <button type="button" onClick={() => setIsRepairedModalOpen(false)} className="px-4 py-2 text-slate-400 hover:text-white">Cancel</button>
                  <button className="bg-green-600 text-white px-4 py-2 rounded-lg">Mark as Repaired</button>
              </div>
          </form>
       </Modal>
    </div>
  );
};

export default KanbanBoard;
