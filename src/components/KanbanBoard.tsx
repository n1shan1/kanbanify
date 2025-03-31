import { useMemo, useState } from "react";
import PlusIcon from "../icons/PlusIcon";
import { Column, Id } from "../types/ColumnTypes";
import ColumnContainer from "./ColumnContainer";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { arrayMove, SortableContext } from "@dnd-kit/sortable";
import { createPortal } from "react-dom";
import { Task } from "../types/TaskTypes";
import TaskCard from "./TaskCard";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { motion } from "framer-motion";

function KanbanBoard() {
  const [columns, setColumns] = useState<Column[]>([]);
  const [activeColumn, setActiveColumn] = useState<Column | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 3 } })
  );
  const columnsID = useMemo(() => columns.map((col) => col.id), [columns]);

  const createColumn = () => {
    const columnToAdd: Column = {
      id: generateId(),
      title: `Column ${columns.length + 1}`,
    };

    setColumns([...columns, columnToAdd]);
    toast.success("Column created successfully!");
  };

  function deleteColumn(id: Id): void {
    const columnToDelete = columns.find((col) => col.id === id);
    const filteredColumns = columns.filter((col) => col.id !== id);
    setColumns(filteredColumns);

    const newTaks = tasks.filter((t) => t.columnId !== id);
    setTasks(newTaks);

    toast.info(`Column "${columnToDelete?.title}" deleted`);
  }

  function onDragStart(event: DragStartEvent) {
    if (event.active.data.current?.type === "column") {
      setActiveColumn(event.active.data.current.column);
      return;
    }
    if (event.active.data.current?.type === "task") {
      setActiveTask(event.active.data.current.task);
      return;
    }
  }

  function createTask(columnId: Id) {
    const newTask: Task = {
      id: generateId(),
      columnId,
      content: `Task ${tasks.length + 1}`,
    };
    setTasks([...tasks, newTask]);
    toast.success("Task added successfully!");
    return newTask;
  }

  function onDragEnd(event: DragEndEvent) {
    setActiveColumn(null);
    setActiveTask(null);
    const { active, over } = event;

    if (!over) {
      return;
    }
    const activeColumnId = active.id;
    const overColumnId = over.id;
    if (activeColumnId === overColumnId) {
      return;
    }
    setColumns((columns) => {
      const activeColumnIndex = columns.findIndex(
        (col) => col.id === activeColumnId
      );
      const overColumnIndex = columns.findIndex(
        (col) => col.id === overColumnId
      );
      return arrayMove(columns, activeColumnIndex, overColumnIndex);
    });
  }

  function updateColumn(id: Id, title: string): void {
    const newColumns = columns.map((col) => {
      if (col.id !== id) return col;
      return { ...col, title };
    });
    setColumns(newColumns);
  }

  function deleteTask(taskId: Id): void {
    const taskToDelete = tasks.find((task) => task.id === taskId);
    const newTasks = tasks.filter((task) => task.id !== taskId);
    setTasks(newTasks);
    toast.info(`Task "${taskToDelete?.content.substring(0, 15)}..." deleted`);
  }

  function updateTask(id: Id, content: string) {
    const newTasks = tasks.map((task) => {
      if (task.id !== id) return task;
      return { ...task, content };
    });
    setTasks(newTasks);
  }

  function onDragOver(event: DragOverEvent) {
    const { active, over } = event;

    if (!over) {
      return;
    }
    const activeId = active.id;
    const overId = over.id;
    if (activeId === overId) {
      return;
    }
    const isActiveATask = active.data.current?.type === "task";
    const isOverATask = over.data.current?.type === "task";

    if (isActiveATask && isOverATask) {
      setTasks((tasks) => {
        const activeIndex = tasks.findIndex((t) => t.id === activeId);
        const overIndex = tasks.findIndex((t) => t.id === overId);

        const previousColumnId = tasks[activeIndex].columnId;
        tasks[activeIndex].columnId = tasks[overIndex].columnId;

        if (previousColumnId !== tasks[overIndex].columnId) {
          const columnTitle = columns.find(
            (col) => col.id === tasks[overIndex].columnId
          )?.title;
          toast.info(`Task moved to "${columnTitle}"`);
        }

        return arrayMove(tasks, activeIndex, overIndex);
      });
    }
    const isOverAColumn = over.data.current?.type === "column";

    if (isActiveATask && isOverAColumn) {
      setTasks((tasks) => {
        const activeIndex = tasks.findIndex((t) => t.id === activeId);

        const previousColumnId = tasks[activeIndex].columnId;
        tasks[activeIndex].columnId = overId;

        if (previousColumnId !== overId) {
          const columnTitle = columns.find((col) => col.id === overId)?.title;
          toast.info(`Task moved to "${columnTitle}"`);
        }

        return arrayMove(tasks, activeIndex, activeIndex);
      });
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="m-auto flex min-h-screen w-full items-center overflow-x-auto overflow-y-hidden px-[20px] md:px-[40px] py-12"
    >
      <DndContext
        sensors={sensors}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onDragOver={onDragOver}
      >
        <div className="m-auto flex gap-4">
          {columns.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-6 md:p-8 rounded-lg bg-mainBackgroundColor border-2 border-columnBackgroundColor w-[90vw] max-w-[800px] min-h-[500px]">
              <motion.div
                initial={{ opacity: 0, y: -30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="mb-8 text-center"
              >
                <motion.div
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 200,
                    damping: 10,
                  }}
                  className="mb-6"
                >
                  <motion.h1
                    className="text-3xl md:text-4xl lg:text-5xl font-bold mb-2 md:mb-4 bg-gradient-to-r from-rose-500 to-purple-600 text-transparent bg-clip-text"
                    animate={{
                      color: ["#f43f5e", "#d946ef", "#f43f5e"],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      repeatType: "reverse",
                    }}
                  >
                    Welcome to Kanbanify
                  </motion.h1>
                  <div className="w-24 h-1 bg-gradient-to-r from-rose-500 to-purple-600 mx-auto rounded-full mb-4"></div>
                </motion.div>

                <motion.p
                  className="text-gray-400 mb-6 max-w-md mx-auto text-sm md:text-base"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.8 }}
                >
                  Organize your tasks efficiently by creating columns and adding
                  tasks to them. Drag and drop to rearrange or move tasks
                  between columns.
                </motion.p>

                <motion.div
                  className="flex flex-wrap justify-center gap-4 mb-8"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                >
                  <Feature
                    icon="✨"
                    title="Drag & Drop"
                    description="Intuitive task management"
                  />
                  <Feature
                    icon="🚀"
                    title="Productivity"
                    description="Stay organized & efficient"
                  />
                  <Feature
                    icon="🔄"
                    title="Real-time"
                    description="Instant updates & changes"
                  />
                </motion.div>

                <motion.p
                  className="text-gray-500 mb-4 text-sm md:text-base"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7, duration: 0.8 }}
                >
                  Get started by creating your first column!
                </motion.p>
              </motion.div>

              <motion.button
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 0 15px rgba(244, 63, 94, 0.5)",
                }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: 0.9,
                  duration: 0.5,
                  type: "spring",
                  stiffness: 400,
                  damping: 10,
                }}
                onClick={() => createColumn()}
                className="h-[60px] w-[250px] cursor-pointer rounded-lg bg-gradient-to-r from-rose-500 to-purple-600 p-4 
                           flex gap-2 items-center justify-center 
                           transition-all duration-300 text-lg font-semibold shadow-lg hover:shadow-rose-500/40"
              >
                <PlusIcon />
                Create First Column
              </motion.button>
            </div>
          ) : (
            <div className="flex gap-4">
              <SortableContext items={columnsID}>
                {columns.map((col) => (
                  <ColumnContainer
                    updateColumn={updateColumn}
                    key={col.id}
                    deleteColumn={deleteColumn}
                    createTask={createTask}
                    column={col}
                    deleteTask={deleteTask}
                    tasks={tasks.filter((task) => task.columnId === col.id)}
                    updateTask={updateTask}
                  />
                ))}
              </SortableContext>
            </div>
          )}
          {columns.length > 0 && (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => createColumn()}
              className="h-[60px] w-[200px] md:w-[350px] min-w-[200px] md:min-w-[350px] cursor-pointer rounded-lg bg-mainBackgroundColor border-2 border-columnBackgroundColor p-4 ring-rose-500 hover:ring-2 flex gap-2 items-center justify-center transition-all duration-300"
            >
              <PlusIcon />
              <span className="hidden md:inline">Add Column</span>
              <span className="md:hidden">Add</span>
            </motion.button>
          )}
        </div>
        {createPortal(
          <DragOverlay>
            {activeColumn && (
              <ColumnContainer
                column={activeColumn}
                deleteColumn={deleteColumn}
                updateColumn={updateColumn}
                createTask={createTask}
                deleteTask={deleteTask}
                updateTask={updateTask}
                tasks={tasks.filter(
                  (task) => task.columnId === activeColumn.id
                )}
              />
            )}
            {activeTask && (
              <TaskCard
                deleteTask={deleteTask}
                updateTask={updateTask}
                task={activeTask}
              />
            )}
          </DragOverlay>,
          document.body
        )}
      </DndContext>
      <ToastContainer position="bottom-right" theme="dark" autoClose={2000} />
    </motion.div>
  );
}

// Feature component for the landing page
function Feature({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -5 }}
      className="flex flex-col items-center p-4 bg-columnBackgroundColor rounded-lg w-[140px] md:w-[180px] text-center"
    >
      <div className="text-3xl mb-2">{icon}</div>
      <h3 className="font-semibold text-white mb-1">{title}</h3>
      <p className="text-xs text-gray-400">{description}</p>
    </motion.div>
  );
}

function generateId() {
  return Math.floor(Math.random() * 10000);
}

export default KanbanBoard;
