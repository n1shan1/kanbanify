import { useState } from "react";
import TrashIcon from "../icons/TrashIcon";
import { Task } from "../types/TaskTypes";
import { Id } from "../types/ColumnTypes";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
interface Props {
  task: Task;
  deleteTask: (taskId: Id) => void;
  updateTask: (taskId: Id, content: string) => void;
}
function TaskCard(props: Props) {
  const { task, deleteTask, updateTask } = props;
  const [mouseHover, setMouseHover] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const {
    setNodeRef,
    listeners,
    attributes,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: "task",
      task,
    },
    disabled: editMode,
  });
  const style = { transition, transform: CSS.Transform.toString(transform) };

  const toggleEditMode = () => {
    setEditMode((prev) => !prev);
    setMouseHover(false);
  };

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="opacity-50 bg-mainBackgroundColor p-2.5 h-[100px] min-h-[100px] items-center flex text-left rounded-xl cursor-grab relative border-2 border-rose-600"
      >
        <p className="text-xs opacity-60"> Release to drop here...</p>
      </div>
    );
  }

  if (editMode) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className="bg-mainBackgroundColor p-2.5 h-[100px] min-h-[100px] items-center flex text-left rounded-xl hover:ring-2 hover:ring-inset hover:ring-rose-500 cursor-grab relative transition-all duration-500"
      >
        <textarea
          name=""
          id=""
          value={task.content}
          autoFocus
          placeholder="Add your content here..."
          onBlur={toggleEditMode}
          onKeyDown={(e) => {
            if (e.key === "Enter" && e.shiftKey) toggleEditMode();
          }}
          onChange={(e) => updateTask(task.id, e.target.value)}
          className="h-[90%] w-full resize-none border-none rounded-lg bg-transparent text-white focus:outline-none"
        ></textarea>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={toggleEditMode}
      className="bg-mainBackgroundColor p-2.5 h-[100px] min-h-[100px] items-center flex text-left rounded-xl hover:ring-2 hover:ring-inset hover:ring-rose-500 cursor-grab relative task transition-all duration-500"
      onMouseEnter={() => setMouseHover(true)}
      onMouseLeave={() => setMouseHover(false)}
    >
      <p className="my-auto h-[90%] w-full overflow-y-auto overflow-x-hidden whitespace-pre-wrap">
        {task.content.length === 0 ? "Add some task here..." : task.content}
      </p>

      {mouseHover && (
        <button
          className="stroke-white absolute right-4 top-1/2 -translate-y-1/2 bg-columnBackgroundColor p-2 rounded opacity-60 hover:opacity-100 transition-all duration-500"
          onClick={() => deleteTask(task.id)}
        >
          <TrashIcon />
        </button>
      )}
    </div>
  );
}

export default TaskCard;
