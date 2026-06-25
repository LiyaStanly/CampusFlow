import Sidebar from "../components/Sidebar";

function AddTask() {
  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <div style={{ padding: "30px" }}>
        <h1>Add Task Page</h1>
      </div>
    </div>
  );
}

export default AddTask;