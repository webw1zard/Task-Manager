import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

interface Task {
  id: string;
  name: string;
  active: boolean;
}

const TaskManager: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [deletedTasks, setDeletedTasks] = useState<Task[]>([]);
  const [input, setInput] = useState<string>("");
  const [search, setSearch] = useState<string>("");
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingTaskName, setEditingTaskName] = useState<string>("");

  const API_URL = "https://fake-api-dfa7.onrender.com/users";

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = () => {
    axios
      .get(API_URL)
      .then((response) => {
        const allTasks = response.data.filter(
          (task: Task) => task && task.name && task.active !== undefined
        );
        setTasks(allTasks.filter((task: Task) => task.active));
        setDeletedTasks(allTasks.filter((task: Task) => !task.active));
      })
      .catch(() => {
        toast.error("Failed to fetch tasks!");
      });
  };

  const addTask = () => {
    if (!input.trim()) {
      toast.error("Task cannot be empty!");
      return;
    }

    const newTask: Omit<Task, "id"> = { name: input, active: true };

    axios
      .post(API_URL, newTask)
      .then((response) => {
        setTasks((prev) => [...prev, response.data]);
        setInput("");
        toast.success("Task added!");
      })
      .catch(() => {
        toast.error("Failed to add task!");
      });
  };

  const deleteTask = (id: string) => {
    axios
      .put(`${API_URL}/${id}`, { active: false })
      .then(() => {
        const deletedTask = tasks.find((task) => task.id === id);
        if (deletedTask) {
          setDeletedTasks((prev) => [...prev, { ...deletedTask, active: false }]);
          setTasks((prev) => prev.filter((task) => task.id !== id));
        }
        toast.info("Task moved to Recently Deleted.");
      })
      .catch(() => {
        toast.error("Failed to delete task!");
      });
  };

  const restoreTask = (id: string) => {
    axios
      .put(`${API_URL}/${id}`, { active: true })
      .then(() => {
        const restoredTask = deletedTasks.find((task) => task.id === id);
        if (restoredTask) {
          setTasks((prev) => [...prev, { ...restoredTask, active: true }]);
          setDeletedTasks((prev) => prev.filter((task) => task.id !== id));
        }
        toast.success("Task restored!");
      })
      .catch(() => {
        toast.error("Failed to restore task!");
      });
  };

  const handleEditTask = (id: string) => {
    if (!editingTaskName.trim()) {
      toast.error("Task name cannot be empty!");
      return;
    }

    axios
      .put(`${API_URL}/${id}`, { name: editingTaskName })
      .then(() => {
        setTasks((prev) =>
          prev.map((task) =>
            task.id === id ? { ...task, name: editingTaskName } : task
          )
        );
        setEditingTaskId(null);
        setEditingTaskName("");
        toast.success("Task updated!");
      })
      .catch(() => {
        toast.error("Failed to update task!");
      });
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const { source, destination } = result;

    if (source.droppableId !== destination.droppableId) return;

    const list = source.droppableId === "tasks" ? tasks : deletedTasks;
    const reorderedList = Array.from(list);
    const [movedItem] = reorderedList.splice(source.index, 1);
    reorderedList.splice(destination.index, 0, movedItem);

    if (source.droppableId === "tasks") {
      setTasks(reorderedList);
    } else {
      setDeletedTasks(reorderedList);
    }
  };

  const filteredTasks = tasks.filter((task) =>
    task.name.toLowerCase().includes(search.toLowerCase())
  );

  const filteredDeletedTasks = deletedTasks.filter((task) =>
    task.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container my-4 task-manager">
      <h1 className="text-center mb-4">Task Organizer</h1>

      <div className="d-flex mb-4">
        <input
          type="text"
          className="form-control me-2"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter task..."
        />
        <button className="btn btn-primary me-2" onClick={addTask}>
          Add
        </button>
        <input
          type="text"
          placeholder="Search tasks..."
          className="form-control"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="row">
          <div className="col-md-6">
            <h3>My Tasks</h3>
            <Droppable droppableId="tasks">
              {(provided: any) => (
                <ul
                  className="list-group"
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                >
                  {filteredTasks.map((task, index) => (
                    <Draggable key={task.id} draggableId={task.id} index={index}>
                      {(provided: any) => (
                        <li
                          className="list-group-item d-flex justify-content-between align-items-center"
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                        >
                          {editingTaskId === task.id ? (
                            <>
                              <input
                                type="text"
                                className="form-control me-2"
                                value={editingTaskName}
                                onChange={(e) => setEditingTaskName(e.target.value)}
                              />
                              <button
                                className="btn btn-success btn-sm"
                                onClick={() => handleEditTask(task.id)}
                              >
                                Save
                              </button>
                              <button
                                className="btn btn-secondary btn-sm ms-2"
                                onClick={() => setEditingTaskId(null)}
                              >
                                Cancel
                              </button>
                            </>
                          ) : (
                            <>
                              <span>{task.name}</span>
                              <div>
                                <button
                                  className="btn btn-warning btn-sm me-2"
                                  onClick={() => {
                                    setEditingTaskId(task.id);
                                    setEditingTaskName(task.name);
                                  }}
                                >
                                  Edit
                                </button>
                                <button
                                  className="btn btn-danger btn-sm"
                                  onClick={() => deleteTask(task.id)}
                                >
                                  Delete
                                </button>
                              </div>
                            </>
                          )}
                        </li>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </ul>
              )}
            </Droppable>
          </div>

          <div className="col-md-6">
            <h3>Recently Deleted</h3>
            <Droppable droppableId="deletedTasks">
              {(provided: any) => (
                <ul
                  className="list-group"
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                >
                  {filteredDeletedTasks.map((task, index) => (
                    <Draggable
                      key={task.id}
                      draggableId={`deleted-${task.id}`}
                      index={index}
                    >
                      {(provided: any) => (
                        <li
                          className="list-group-item d-flex justify-content-between align-items-center"
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                        >
                          <span>{task.name}</span>
                          <button
                            className="btn btn-success btn-sm"
                            onClick={() => restoreTask(task.id)}
                          >
                            Undo
                          </button>
                        </li>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </ul>
              )}
            </Droppable>
          </div>
        </div>
      </DragDropContext>
    </div>
  );
};

export default TaskManager;