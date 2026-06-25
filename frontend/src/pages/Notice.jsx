import Sidebar from "../components/Sidebar";

function Notice() {
  return (
    <div style={{ display: "flex" }}>
      <Sidebar />

      <div style={{ padding: "30px" }}>
        <h1>Notice Summarizer</h1>
      </div>
    </div>
  );
}

export default Notice;