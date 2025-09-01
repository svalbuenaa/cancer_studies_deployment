import { useState } from "react";
import MapNumeric from "./MapNumeric";
import SelectCancerMap from "./SelectCancerMap";

const CancerMapSwitcher = ({ numericCsvPath, selectCancerCsvPath }) => {
  const [mapType, setMapType] = useState("cumulative");

  return (
    <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
      {/* Selector */}
      <div style={{ marginBottom: "1rem", color: "white", display: "flex", gap: "10px", alignItems: "center" }}>
        <label htmlFor="map-select">Select map:</label>
        <select
          id="map-select"
          value={mapType}
          onChange={(e) => setMapType(e.target.value)}
          style={{ padding: "5px", borderRadius: "5px", border: "1px solid white", backgroundColor: "#333", color: "white" }}
        >
          <option value="cumulative">Cumulative cancer incidence</option>
          <option value="selected">Selected cancer incidence</option>
        </select>
      </div>

      {/* Render the selected map */}
      {mapType === "cumulative" ? (
        <MapNumeric csvPath={numericCsvPath} />
      ) : (
        <SelectCancerMap csvPath={selectCancerCsvPath} />
      )}
    </div>
  );
};

export default CancerMapSwitcher;
