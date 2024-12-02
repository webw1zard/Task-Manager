import React from "react";
import TaskManager from "./TaskManager";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const App: React.FC = () => {
  return (
    <div>
      <TaskManager />
      <ToastContainer />
    </div>
  );
};

export default App;
