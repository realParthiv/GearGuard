import React, { useState, useEffect } from "react";
import api from "../../services/api";
import dayjs from "dayjs";
import Loader from "../../components/common/Loader";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
} from "lucide-react";
import clsx from "clsx";

const MaintenanceCalendar = () => {
  const [currentDate, setCurrentDate] = useState(dayjs());
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        // Fetch for current month range
        const start = currentDate.startOf("month").format("YYYY-MM-DD");
        const end = currentDate.endOf("month").format("YYYY-MM-DD");
        const data = await api.maintenance.getCalendar(start, end);
        console.log("Raw Calendar Data:", data);
        
        // Normalize fields
        const normalizedData = data.map(evt => ({
            ...evt,
            scheduledDate: evt.scheduledDate || evt.scheduled_date || evt.start_date || evt.start, // Handle varied date keys
            subject: evt.subject || evt.title,
            equipmentName: evt.equipmentName || evt.equipment_details?.name || evt.equipment_name,
            assignedTo: evt.assignedTo || evt.assigned_technician_details?.full_name || evt.assigned_user?.full_name,
            priority: evt.priority || (evt.request_type === "CORRECTIVE" ? "HIGH" : "MEDIUM")
        }));
        console.log("Normalized Calendar Data:", normalizedData);
        setEvents(normalizedData);
      } catch (error) {
        console.error("Failed to fetch calendar events:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, [currentDate]);

  const daysInMonth = currentDate.daysInMonth();
  const firstDayOfMonth = currentDate.startOf("month").day(); // 0 = Sunday
  const days = [];

  // Fill empty slots for previous month
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null);
  }

  // Fill days of current month
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(currentDate.date(i));
  }

  const getEventsForDay = (day) => {
    if (!day) return [];
    const dateStr = day.format("YYYY-MM-DD");
    return events.filter((e) => e.scheduledDate === dateStr);
  };

  if (loading) return <Loader />;

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <CalendarIcon className="w-8 h-8 text-blue-500" />
          {currentDate.format("MMMM YYYY")}
        </h1>
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentDate(currentDate.subtract(1, "month"))}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => setCurrentDate(dayjs())}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors font-medium"
          >
            Today
          </button>
          <button
            onClick={() => setCurrentDate(currentDate.add(1, "month"))}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="bg-slate-900 rounded-2xl border border-slate-800 flex-1 flex flex-col overflow-hidden">
        <div className="grid grid-cols-7 border-b border-slate-800 bg-slate-900/50">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div
              key={day}
              className="py-3 text-center text-slate-400 font-medium text-sm uppercase tracking-wider"
            >
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 flex-1 auto-rows-fr">
          {days.map((day, index) => {
            const dayEvents = getEventsForDay(day);
            const isToday = day && day.isSame(dayjs(), "day");

            return (
              <div
                key={index}
                className={clsx(
                  "border-b border-r border-slate-800 p-2 min-h-[100px] relative group transition-colors",
                  !day && "bg-slate-950/30",
                  day && "hover:bg-slate-800/30"
                )}
              >
                {day && (
                  <>
                    <span
                      className={clsx(
                        "text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full mb-2",
                        isToday ? "bg-blue-600 text-white" : "text-slate-400"
                      )}
                    >
                      {day.date()}
                    </span>
                    <div className="space-y-1">
                      {dayEvents.map((event) => (
                        <div
                          key={event.id}
                          className={clsx(
                            "text-xs p-1.5 rounded cursor-pointer hover:opacity-80 flex flex-col gap-0.5 mb-1",
                            event.priority === "CRITICAL"
                              ? "bg-red-500/20 text-red-400 border border-red-500/20"
                              : event.priority === "HIGH"
                              ? "bg-orange-500/20 text-orange-400 border border-orange-500/20"
                              : "bg-blue-500/20 text-blue-400 border border-blue-500/20"
                          )}
                          title={`${event.subject} - ${event.equipmentName}`}
                        >
                          <div className="font-semibold truncate">
                            {event.subject}
                          </div>
                          <div className="text-[10px] opacity-75 truncate">
                            {event.equipmentName}
                          </div>
                          {event.assignedTo && (
                            <div className="text-[10px] opacity-75 truncate flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                              {event.assignedTo}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MaintenanceCalendar;
