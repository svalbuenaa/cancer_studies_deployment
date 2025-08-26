import React, { useEffect, useState } from "react";
import Plot from "react-plotly.js";
import Papa from "papaparse";

const MapNumeric = ({ csvPath }) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    Papa.parse(csvPath, {
      download: true,
      header: true,
      complete: (results) => {
        const validData = results.data.filter(d => d.ASR && !isNaN(parseFloat(d.ASR)));
        setData(validData);
      },
    });
  }, [csvPath]);

  if (data.length === 0) {
    return (
      <div style={{ color: "white", textAlign: "center", marginTop: "50px" }}>
        <p>Loading map data...</p>
      </div>
    );
  }

  const asrValues = data.map((d) => parseFloat(d.ASR));
  const minASR = Math.min(...asrValues);
  const maxASR = Math.max(...asrValues);
  
  const tickStep = (maxASR - minASR) / 4;
  const tickValues = [
    minASR,
    minASR + tickStep,
    minASR + 2 * tickStep,
    minASR + 3 * tickStep,
    maxASR,
  ].map((value) => parseFloat(value.toFixed(2)));

  const plotData = {
    type: "choropleth",
    locations: data.map(d => d.Country),
    z: asrValues,
    text: data.map(d => d.Country),
    colorscale: [
      [0, "#FFFF66"],
      [0.25, "#FFCC33"],
      [0.5, "#FF6600"],
      [0.75, "#CC3300"],
      [1, "#800000"]
    ],
    marker: {
      line: {
        color: "white",
        width: 0.5,
      },
    },
    locationmode: "country names",
    colorbar: {
      title: {
        text: "Incidence<br>(per 100,000)",
        font: { color: "white" }
      },
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
      tickfont: { color: "white" },
    },
    hovertemplate:
      "<b>%{text}</b><br>Incidence: %{z} per 100,000<extra></extra>",
    // Add the hover property for the marker line
    hoverlabel: {
      bordercolor: 'rgba(255, 255, 255, 0.7)',
      bgcolor: 'rgba(0, 0, 0, 0.7)',
      font: { color: 'white' }
    },
    // The most effective way to add a hover effect to a choropleth map
    // is to use `hovertemplate` and a marker line with a prominent color.
    // Plotly doesn't have a direct 'hovercolor' property for the fill.
  };

  const config = {
    modeBarButtonsToRemove: [
      'zoomInGeo', 'zoomOutGeo', 'panGeo', 'select2d', 'lasso2d', 'autoScaleGeo', 'hoverClosestGeo', 'hoverCompareGeo', 'zoom2d', 'pan2d', 'resetViews', 'select', 'lasso', 'hoverClosest', 'hoverCompare', 'toggleSpikelines', 'sendDataToCloud',
    ],
    displaylogo: false,
    modeBar: {
      bgcolor: 'rgba(255, 255, 255, 0)',
      orientation: 'h',
    }
  };

  return (
    <div className="plotly-responsive-plot-container" style={{ position: "relative" }}>
      <Plot
        data={[plotData]}
        layout={{
          title: {
            text: "Cancer Incidence per Country",
            x: 0.5,
            xanchor: "center",
            font: { size: 22, color: "white" },
            y: 0.93,
          },
          geo: {
            projection: { type: "natural earth" },
            showframe: false,
            showcoastlines: true,
            coastlinecolor: "gray",
            oceancolor: "#242424",
            landcolor: "#242424",
            bgcolor: "#242424",
            domain: { x: [0, 1], y: [0, 1] },
          },
          margin: { t: 40, b: 80, l: 40, r: 40 },
          paper_bgcolor: "#242424",
          plot_bgcolor: "#242424",
          autosize: true,
        }}
        config={config}
        useResizeHandler={true}
        className="plotly-responsive-plot"
      />
      <style jsx>{`
        .modebar {
          top: auto !important;
          bottom: -60px !important;
          right: 7% !important;
          transform: translateX(50%);
        }
      `}</style>
    </div>
  );
};

export default MapNumeric;