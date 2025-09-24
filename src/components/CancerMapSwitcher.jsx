import React, { useState } from "react";
import MapCummulativeIncidence from "./MapCummulativeIncidence";
import MapSelectedCancer from "./MapSelectedCancer";

const CancerMapSwitcher = ({ numericCsvPath, selectCancerCsvPath }) => {
  const [activeMap, setActiveMap] = useState("cumulative");

  return (
    <div style={{ width: "100%", marginTop: "2rem" }}>
      {/* Toggle buttons */}
      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        <button
          onClick={() => setActiveMap("cumulative")}
          style={{
            padding: "10px 20px",
            marginRight: "10px",
            borderRadius: "6px",
            border: activeMap === "cumulative" ? "2px solid #333" : "1px solid #ccc",
            backgroundColor: activeMap === "cumulative" ? "#eee" : "#fff",
            cursor: "pointer",
          }}
        >
          Cumulative Incidence
        </button>
        <button
          onClick={() => setActiveMap("selected")}
          style={{
            padding: "10px 20px",
            borderRadius: "6px",
            border: activeMap === "selected" ? "2px solid #333" : "1px solid #ccc",
            backgroundColor: activeMap === "selected" ? "#eee" : "#fff",
            cursor: "pointer",
          }}
        >
          By Cancer Type
        </button>
      </div>

      {/* Conditional map rendering */}
      {activeMap === "cumulative" ? (
        <MapCummulativeIncidence csvPath={numericCsvPath} />
      ) : (
        <MapSelectedCancer csvPath={selectCancerCsvPath} />
      )}
    </div>
  );
};

export default CancerMapSwitcher;
