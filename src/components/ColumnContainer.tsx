import { SortableContext, useSortable } from "@dnd-kit/sortable";
import TrashIcon from "../icons/TrashIcon";
import { Column, Id } from "../types/ColumnTypes";
import { CSS } from "@dnd-kit/utilities";
import { useMemo, useState } from "react";
import PlusIcon from "../icons/PlusIcon";
import { Task } from "../types/TaskTypes";
import TaskCard from "./TaskCard";
import { motion } from "framer-motion";

interface Props {
  column: Column;
  children?: React.ReactNode;
  className?: string;
  updateColumn: (id: Id, title: string) => void;
  deleteColumn: (id: Id) => void;
  createTask: (columnId: Id) => void;
  tasks: Task[];
  deleteTask: (taskId: Id) => void;
  updateTask: (taskId: Id, content: string) => void;
}

function ColumnContainer(props: Props) {
  const {
    column,
    deleteColumn,
    updateColumn,
    createTask,
    tasks,
    deleteTask,
    updateTask,
  } = props;
  const [editMode, setEditMode] = useState(false);

  const taskIds = useMemo(() => {
    return tasks.map((task) => task.id);
  }, [tasks]);

  const {
    setNodeRef,
    listeners,
    attributes,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: column.id,
    data: {
      type: "column",
      column,
    },
    disabled: editMode,
  });
  const style = { transition, transform: CSS.Transform.toString(transform) };

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="bg-columnBackgroundColor w-[280px] md:w-[350px] h-[500px] max-h-[500px] rounded-md flex flex-col opacity-60 transition-all duration-300 border-2 border-rose-500/40 shadow-lg shadow-rose-500/20"
      ></div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      ref={setNodeRef}
      style={style}
      className="bg-columnBackgroundColor w-[280px] md:w-[350px] h-[500px] max-h-[500px] rounded-md flex flex-col shadow-md hover:shadow-lg hover:shadow-rose-500/10 transition-shadow duration-300"
      data-column-id={column.id}
    >
      <div
        {...attributes}
        {...listeners}
        onClick={() => setEditMode(true)}
        className="bg-mainBackgroundColor text-md h-[60px] cursor-grab rounded-md rounded-b-none p-3 font-bold border-columnBackgroundColor border-4 flex items-center justify-between"
      >
        <div className="flex gap-2 items-center overflow-hidden">
          <div className="flex justify-center items-center bg-columnBackgroundColor px-2 py-1 text-sm rounded-full min-w-[24px]">
            {tasks.length}
          </div>
          {!editMode && (
            <span className="transition-all duration-200 truncate">
              {column.title}
            </span>
          )}
          {editMode && (
            <input
              className="bg-black focus:border-rose-500 border rounded outline-none px-3 py-1 w-full max-w-[160px]"
              value={column.title}
              onChange={(e) => updateColumn(column.id, e.target.value)}
              autoFocus
              onBlur={() => setEditMode(false)}
              onKeyDown={(e) => {
                if (e.key !== "Enter") return;
                setEditMode(false);
              }}
            />
          )}
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            deleteColumn(column.id);
          }}
          className="stroke-gray-500 hover:stroke-rose-500 hover:bg-columnBackgroundColor rounded px-1 py-2 transition-colors duration-200"
        >
          <TrashIcon />
        </button>
      </div>
      <div className="flex flex-grow flex-col gap-4 p-4 overflow-x-hidden overflow-y-auto task-container">
        <SortableContext items={taskIds}>
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              updateTask={updateTask}
              deleteTask={() => deleteTask(task.id)}
              task={task}
            />
          ))}
        </SortableContext>
        {tasks.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center justify-center h-full flex-col gap-2 text-gray-500 italic"
          >
            <p>No tasks yet</p>
            <p className="text-sm">Drag tasks here or add a new one</p>
          </motion.div>
        )}
      </div>
      <button
        className="flex gap-3 items-center justify-center border-columnBackgroundColor border-2 rounded-md p-4 sborder-x-columnBackgroundColor hover:bg-mainBackgroundColor hover:text-rose-500 active:bg-black transition-all duration-300 group"
        onClick={() => {
          createTask(column.id);
          // Add a subtle animation effect by scrolling to bottom after adding task
          setTimeout(() => {
            const container = document.querySelector(
              `[data-column-id="${column.id}"] .task-container`
            );
            if (container) container.scrollTop = container.scrollHeight;
          }, 100);
        }}
      >
        <PlusIcon />
        Add Task
      </button>
    </motion.div>
  );
}

export default ColumnContainer;
