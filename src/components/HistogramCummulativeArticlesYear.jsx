import React, { useEffect, useState } from "react";
import Plot from "react-plotly.js";
import Papa from "papaparse";

const HistogramCummulativeArticlesYear = ({ csvPath }) => {
  const [data, setData] = useState([]);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  // Track window width for responsive styling
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Load CSV
  useEffect(() => {
    Papa.parse(csvPath, {
      download: true,
      header: true,
      complete: (results) => {
        const sortedData = results.data
          .filter(d => d.Year && d.Articles)
          .sort((a, b) => a.Year - b.Year);
        setData(sortedData);
      },
    });
  }, [csvPath]);

  if (data.length === 0) {
    return (
      <div style={{ color: "black", textAlign: "center", marginTop: "50px" }}>
        <p>Loading articles data...</p>
      </div>
    );
  }

  const years = data.map(d => d.Year);
  const articles = data.map(d => parseFloat(d.Articles));

  const annotations = data.map(d => ({
    x: d.Year,
    y: d.Articles,
    text: d.Articles,
    xref: 'x',
    yref: 'y',
    yshift: 35,
    showarrow: false,
    font: { color: 'black', size: 12 },
    textangle: -90,
  }));

  const plotData = {
    x: years,
    y: articles,
    type: "bar",
    marker: { color: "#4682B4" },
    hovertemplate: '<b>Year:</b> %{x}<br><b>Studies:</b> %{y:d}<extra></extra>',
    name: '',
  };

  const config = {
    responsive: true,
    displaylogo: false,
    modeBarButtonsToRemove: [
      'toImage', 'zoom2d', 'pan2d', 'select2d', 'lasso2d', 'zoomIn2d', 'zoomOut2d',
      'autoScale2d', 'hoverClosestCartesian', 'hoverCompareCartesian'
    ],
    modeBarButtons: [['resetScale2d']], // ensures reset button is visible on right
  };

  const titleStyle = {
    textAlign: "center",
    marginBottom: windowWidth <= 1080 ? "1rem" : "2rem",
    fontWeight: "normal",
    fontSize: windowWidth <= 1080 ? "16px" : "20px",
    color: "black",
  };

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        position: "relative",
      }}
    >
      <h2 style={titleStyle}>Number of studies per year</h2>
      <Plot
        data={[plotData]}
        layout={{
          autosize: true,
          margin: {
            t: 20,
            b: windowWidth <= 1080 ? 180 : 150,
            l: 60,
            r: 60,
          },
          paper_bgcolor: "#f6f8fa",
          plot_bgcolor: "#f6f8fa",
          xaxis: {
            title: {
              text: "Year",
              font: { color: "black", size: 16 },
            },
            tickmode: 'array',
            tickvals: years,
            ticktext: years,
            tickangle: -90,
            showgrid: false,
            zeroline: false,
            linecolor: "black",
            tickfont: { color: "black" },
          },
          yaxis: {
            title: {
              text: "Number of studies",
              font: { color: "black", size: 16 },
            },
            showgrid: true,
            zeroline: false,
            showline: false,
            gridcolor: "rgba(0,0,0,0.075)",
            tickfont: { color: "black" },
            range: [0, Math.max(...articles) * 1.25],
          },
          annotations,
        }}
        config={config}
        useResizeHandler={true}
        style={{ width: "100%", height: windowWidth <= 1080 ? 400 : 620 }}
      />
      <style jsx>{`
        .modebar {
          top: auto !important;
          bottom: 5px !important;
          right: 10px !important;
        }
      `}</style>
    </div>
  );
};

export default HistogramCummulativeArticlesYear;
