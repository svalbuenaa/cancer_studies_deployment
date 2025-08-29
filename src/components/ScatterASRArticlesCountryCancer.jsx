import React, { useEffect, useState, useMemo } from "react";
import Plot from "react-plotly.js";

// Define a color palette for the 10-15 most relevant research countries
const countryColors = {
  "United States": "#1f77b4",
  "United Kingdom": "#ff7f0e",
  "Germany": "#2ca02c",
  "France": "#d62728",
  "Italy": "#9467bd",
  "Canada": "#8c564b",
  "Japan": "#e377c2",
  "China": "#8351c4",
  "Australia": "#bcbd22",
  "Netherlands": "#17becf",
  "Switzerland": "#aec7e8",
  "Sweden": "#ffbb78",
  "Spain": "#98df8a",
  "South Korea": "#ff9896",
  "Belgium": "#c5b0d5"
};

// All other countries will be grey
const defaultColor = "grey";

const ScatterASRArticlesCountryCancer = ({ csvPath, selectedCancer, setSelectedCancer }) => {
  const [data, setData] = useState([]);
  const [uniqueCancers, setUniqueCancers] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(csvPath);
        const text = await response.text();
        const lines = text.split("\n").filter(line => line.trim() !== "");
        if (lines.length > 1) {
          const header = lines[0].split(",").map(h => h.trim());
          const parsedData = lines.slice(1).map(line => {
            const values = line.split(",");
            if (values.length === header.length) {
              const obj = header.reduce((acc, key, index) => {
                acc[key] = values[index].trim();
                return acc;
              }, {});
              // Convert numeric fields once
              obj.Articles = parseInt(obj.Articles);
              obj.ASR = parseFloat(obj.ASR);
              return obj;
            }
            return null;
          }).filter(d => d && d.Cancer && d.Country && !isNaN(d.Articles) && !isNaN(d.ASR));

          setData(parsedData);

          const cancers = [...new Set(parsedData.map(d => d.Cancer))].sort();
          setUniqueCancers(cancers);

          if (!selectedCancer && cancers.length > 0) setSelectedCancer(cancers[0]);
        }
      } catch (error) {
        console.error("Error fetching CSV:", error);
      }
    };

    fetchData();
  }, [csvPath]);

  const handleCancerChange = (event) => setSelectedCancer(event.target.value);

  // Memoize filtered and sorted data
  const filteredData = useMemo(
    () => data.filter(d => d.Cancer === selectedCancer),
    [data, selectedCancer]
  );

  const sortedByArticles = useMemo(
    () => [...filteredData].sort((a, b) => b.Articles - a.Articles),
    [filteredData]
  );

  const top5 = useMemo(() => sortedByArticles.slice(0, 5), [sortedByArticles]);
  const others = useMemo(() => sortedByArticles.slice(5), [sortedByArticles]);

  // Assign colors by country
  const getCountryColor = (country) => countryColors[country] || defaultColor;

  // Top 5 countries → colored
  const topTrace = {
    x: top5.map(d => d.ASR),
    y: top5.map(d => d.Articles),
    text: top5.map(d => d.Country),
    mode: "markers+text",
    type: "scatter",
    textposition: "top center",
    textfont: { color: "white" },
    marker: {
      size: 14,
      color: top5.map(d => getCountryColor(d.Country)), // colored
      opacity: 0.9,
      line: { width: 1, color: "#333" }
    },
    hovertemplate:
      `<b>Country:</b> %{text}<br>` +
      `<b>Cancer:</b> ${selectedCancer}<br>` +
      `<b>Incidence:</b> %{x}<br>` +
      `<b>Articles:</b> %{y}<extra></extra>`,
    showlegend: false,
  };

  // Other countries → grey
  const othersTrace = {
    x: others.map(d => d.ASR),
    y: others.map(d => d.Articles),
    text: others.map(d => d.Country),
    mode: "markers",
    type: "scatter",
    marker: {
      size: 10,
      color: defaultColor, // grey
      opacity: 0.75,
      line: { width: 1, color: "#333" }
    },
    hovertemplate:
      `<b>Country:</b> %{text}<br>` +
      `<b>Cancer:</b> ${selectedCancer}<br>` +
      `<b>Incidence:</b> %{x}<br>` +
      `<b>Articles:</b> %{y}<extra></extra>`,
    showlegend: false,
  };

  const config = {
    responsive: true,
    displaylogo: false,
    modeBarButtonsToRemove: [
      "zoom2d","pan2d","select2d","lasso2d","zoomIn2d","zoomOut2d",
      "autoScale2d","hoverClosestCartesian","hoverCompareCartesian",
    ],
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
      <Plot
        data={[topTrace, othersTrace]}
        layout={{
          title: {
            text: `ASR vs Articles for <b>${selectedCancer}</b>`,
            x: 0.5,
            xanchor: "center",
            font: { size: 22, color: "white" },
          },
          xaxis: {
            title: { text: "Incidence (ASR)", font: { color: "white", size: 16 } },
            showgrid: true,
            zeroline: false,
            linecolor: "white",
            gridcolor: "rgba(255,255,255,0.2)",
            tickfont: { color: "white" },
          },
          yaxis: {
            title: { text: "Number of Articles", font: { color: "white", size: 16 } },
            showgrid: true,
            zeroline: false,
            linecolor: "white",
            gridcolor: "rgba(255,255,255,0.2)",
            tickfont: { color: "white" },
            tickformat: "~s"
          },
          margin: { t: 60, b: 60, l: 80, r: 40 },
          paper_bgcolor: "#242424",
          plot_bgcolor: "#242424",
          hovermode: "closest",
          showlegend: false,
          width: 700,
          height: 700,
          shapes: [
            {
              type: 'line',
              xref: 'paper',
              yref: 'paper',
              x0: 0,
              y0: 0,
              x1: 1,
              y1: 1,
              line: { color: '#808080', width: 2, dash: 'dash', opacity: 0.5 }
            }
          ]
        }}
        config={config}
      />

      <div style={{ marginTop: "20px", color: "white", textAlign: "center" }}>
        <label htmlFor="cancer-select" style={{ marginRight: "10px" }}>Cancer:</label>
        <select
          id="cancer-select"
          onChange={handleCancerChange}
          style={{
            padding: "5px 10px",
            borderRadius: "5px",
            border: "1px solid white",
            backgroundColor: "#333",
            color: "white",
          }}
          value={selectedCancer}
        >
          {uniqueCancers.map(cancer => (
            <option key={cancer} value={cancer}>{cancer}</option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default ScatterASRArticlesCountryCancer;
