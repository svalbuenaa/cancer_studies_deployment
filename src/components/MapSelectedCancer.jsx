import React, { useEffect, useState } from "react";
import Plot from "react-plotly.js";
import countryCodeMap from "../utils/countryCodes";

const MapSelectedCancer = ({ csvPath }) => {
  const [data, setData] = useState([]);
  const [uniqueCancers, setUniqueCancers] = useState([]);
  const [selectedCancer, setSelectedCancer] = useState("");
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(csvPath);
        const text = await response.text();
        const lines = text.split("\n").filter((line) => line.trim() !== "");
        if (lines.length > 1) {
          const header = lines[0].split(",").map((h) => h.trim());
          const parsedData = lines
            .slice(1)
            .map((line) => {
              const values = line.split(",");
              if (values.length === header.length) {
                return header.reduce((obj, key, index) => {
                  obj[key] = values[index].trim();
                  return obj;
                }, {});
              }
              return null;
            })
            .filter(
              (d) =>
                d && d.Cancer && d.Country && d.ASR && !isNaN(parseFloat(d.ASR))
            );
          setData(parsedData);
          const cancers = [...new Set(parsedData.map((d) => d.Cancer))].sort();
          setUniqueCancers(cancers);
          setSelectedCancer(
            cancers.includes("Breast cancer") ? "Breast cancer" : cancers[0]
          );
        }
      } catch (error) {
        console.error("Error fetching CSV:", error);
      }
    };
    fetchData();
  }, [csvPath]);

  if (data.length === 0 || !selectedCancer) {
    return (
      <div style={{ color: "black", textAlign: "center", marginTop: "50px" }}>
        <p>Loading cancer map...</p>
      </div>
    );
  }

  const filteredData = data.filter((d) => d.Cancer === selectedCancer);
  const asrValues = filteredData.map((d) => parseFloat(d.ASR));
  const minASR = Math.min(...asrValues);
  const maxASR = Math.max(...asrValues);
  const tickStep = (maxASR - minASR) / 4;
  const tickValues = Array.from({ length: 5 }, (_, i) =>
    parseFloat((minASR + i * tickStep).toFixed(2))
  );

  const plotData = {
    type: "choropleth",
    locations: filteredData.map((d) => countryCodeMap[d.Country]),
    z: asrValues,
    text: filteredData.map((d) => d.Country),
    colorscale: [
      [0, "#FFFF66"],
      [0.25, "#FFCC33"],
      [0.5, "#FF6600"],
      [0.75, "#CC3300"],
      [1, "#800000"],
    ],
    marker: { line: { color: "black", width: 0.5 } },
    locationmode: "ISO-3",
    colorbar: {
      title: { text: "Incidence<br>(per 100,000)", font: { color: "black" } },
      thickness: 10,
      len: 0.5,
      y: -0.1,
      yanchor: "bottom",
      x: 0.5,
      xanchor: "center",
      outlinewidth: 1,
      outlinecolor: "gray",
      orientation: "h",
      tickvals: tickValues,
      ticktext: tickValues.map(String),
      tickfont: { color: "black" },
    },
    hovertemplate: `<b>%{text}</b><br>${selectedCancer}<br>Incidence: %{z} per 100,000<extra></extra>`,
    hoverlabel: {
      bordercolor: "rgba(0,0,0,0.7)",
      bgcolor: "rgba(255,255,255,0.7)",
      font: { color: "black" },
    },
  };

  const config = {
    modeBarButtonsToRemove: [
      "zoomInGeo",
      "zoomOutGeo",
      "panGeo",
      "select2d",
      "lasso2d",
      "autoScaleGeo",
      "hoverClosestGeo",
      "hoverCompareGeo",
      "zoom2d",
      "pan2d",
      "resetViews",
      "select",
      "lasso",
      "hoverClosest",
      "hoverCompare",
      "toggleSpikelines",
      "sendDataToCloud",
	  "toImage",
    ],
    displaylogo: false,
    responsive: true,
    scrollZoom: true,
  };

  const plotTitle =
  windowWidth <= 1080
    ? `Incidence of <b>${selectedCancer}</b> per country`
    : `Incidence of <b>${selectedCancer}</b> per country`;

  const titleStyle = {
	textAlign: "center",
	marginBottom: windowWidth <= 1080 ? "0rem" : "0rem",
	fontWeight: "normal",
	fontSize: windowWidth <= 1080 ? "16px" : "20px",
	color: "black",
  };

  return (
    <div
      style={{
        width: "100%",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <h2 style={titleStyle} dangerouslySetInnerHTML={{ __html: plotTitle }} />
      <Plot
        data={[plotData]}
        layout={{
          geo: {
            projection: { type: "natural earth" },
            showframe: false,
            showcoastlines: true,
            coastlinecolor: "gray",
            oceancolor: "#f6f8fa",
            landcolor: "#f6f8fa",
            bgcolor: "#f6f8fa",
            dragmode: "zoom",
			scope: "world",
			showland: true,
			visible: true,
			lataxis: { range: [-60, 90] }
          },
          margin: { t: windowWidth <= 1080 ? 0 : 10, b: 40, l: 10, r: 10 },
          paper_bgcolor: "#f6f8fa",
          plot_bgcolor: "#f6f8fa",
        }}
        config={config}
        useResizeHandler={true}
        style={{ width: "100%", height: windowWidth <= 1080 ? 350 : 550 }}
      />
      <div style={{ marginTop: "20px", textAlign: "center" }}>
        <label htmlFor="cancer-select" style={{ marginRight: "10px" }}>
          Select Cancer Type:
        </label>
        <select
          id="cancer-select"
          value={selectedCancer}
          onChange={(e) => setSelectedCancer(e.target.value)}
          style={{
            padding: "5px",
            fontSize: "14px",
            borderRadius: "5px",
            border: "1px solid #ccc",
          }}
        >
          {uniqueCancers.map((cancer) => (
            <option key={cancer} value={cancer}>
              {cancer}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default MapSelectedCancer;
