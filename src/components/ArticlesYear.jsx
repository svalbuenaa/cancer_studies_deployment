import React, { useEffect, useState } from "react";
import Plot from "react-plotly.js";
import Papa from "papaparse";

const ArticlesYear = ({ csvPath }) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    Papa.parse(csvPath, {
      download: true,
      header: true,
      complete: (results) => {
        const sortedData = results.data.sort((a, b) => a.Year - b.Year);
        const validData = sortedData.filter(d => d.Year && d.Articles);
        setData(validData);
      },
    });
  }, [csvPath]);

  if (data.length === 0) {
    return (
      <div style={{ color: "white", textAlign: "center", marginTop: "50px" }}>
        <p>Loading articles data...</p>
      </div>
    );
  }

  const years = data.map(d => d.Year);
  const articles = data.map(d => d.Articles);
  
  const annotations = data.map((d) => ({
  x: d.Year,
  y: d.Articles,
  text: d.Articles,
  xref: 'x',
  yref: 'y',
  yshift: 35,
  showarrow: false,
  font: {
    color: 'white',
    size: 12,
  },
  textangle: -90, // Rotate the text vertically
}));

  const plotData = {
    x: years,
    y: articles,
    type: "bar",
    marker: {
      color: "#4682B4",
    },
    hovertemplate: '<b>Year:</b> %{x}<br><b>Studies:</b> %{y}<extra></extra>',
    name: '',
  };

  const config = {
    responsive: true,
    displaylogo: false,
    modeBarButtonsToRemove: [
      'zoom2d', 'pan2d', 'select2d', 'lasso2d', 'zoomIn2d', 'zoomOut2d', 'autoScale2d', 'resetScale2d', 'hoverClosestCartesian', 'hoverCompareCartesian'
    ],
  };

  return (
    <div className="plotly-responsive-plot-container">
      <Plot
        data={[plotData]}
        layout={{
          title: {
            text: "Number of studies per year",
            x: 0.5,
            xanchor: "center",
            font: { size: 22, color: "white" },
            y: 0.95,
          },
          xaxis: {
            title: {
              text: "Year",
              font: { color: "white",
					  size: 16},
            },
            tickmode: 'array',
            tickvals: years,
            ticktext: years,
            tickangle: -90,
            showgrid: false,
            zeroline: false,
            linecolor: "white",
            gridcolor: "rgba(255, 255, 255, 0.2)",
            tickfont: { color: "white" },
          },
          yaxis: {
            title: {
              text: "Number of studies",
              font: { color: "white",
					  size: 16},
            },
            showgrid: true,
            zeroline: false,
            // Remove the y-axis line
            showline: false,
            linecolor: "white",
            gridcolor: "rgba(255, 255, 255, 0.2)",
            tickfont: { color: "white" },
			range: [0, Math.max(...articles) * 1.25],
          },
          margin: { t: 60, b: 150, l: 60, r: 60 },
          paper_bgcolor: "#242424",
          plot_bgcolor: "#242424",
          autosize: true,
          annotations: annotations,
        }}
        config={config}
        useResizeHandler={true}
        className="plotly-responsive-plot"
      />
    </div>
  );
};

export default ArticlesYear;