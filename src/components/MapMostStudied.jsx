import React, { useEffect, useState } from "react";
import Plot from "react-plotly.js";
import Papa from "papaparse";
import countryCodeMap from "../utils/countryCodes";

const colorMapping = {
  'Breast cancer': '#377eb8',      
  'Prostate cancer': '#4daf4a',    
  'Lung cancer': '#984ea3',        
  'Colorectal cancer': '#66c2a5',  
  'Liver cancer': '#f781bf',       
  'Stomach cancer': '#8da0cb',     
  'Cervical cancer': '#e78ac3',    
  'Leukemia': '#a65628',           
  'Esophageal cancer': '#ffbaba',
  'Skin cancer': '#ff7f00',
  'Anal cancer': '#b15928',
  'Brain cancer': '#1f78b4', 
  'Mesothelioma': '#33a02c', 
  'Kidney cancer': '#6a3d9a', 
  'Multiple myeloma': '#e31a1c', 
  'Laryngeal cancer': '#fdbf6f', 
  'Ovarian cancer': '#cab2d6',
  'Colon cancer': '#ffff99', 
  'Penile cancer': '#a6cee3',  
};

const MapMostStudied = ({ csvPath }) => {
  const [data, setData] = useState([]);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  // Track window width for responsive title
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Load CSV data
  useEffect(() => {
    Papa.parse(csvPath, {
      download: true,
      header: true,
      complete: (results) => {
        const validData = results.data.filter(d => d.Cancer && d.Articles && d.Country);
        setData(validData);
      },
    });
  }, [csvPath]);

  if (data.length === 0) {
    return (
      <div style={{ color: "black", textAlign: "center", marginTop: "50px" }}>
        <p>Loading map data...</p>
      </div>
    );
  }

  const uniqueCancers = [...new Set(data.map(d => d.Cancer))].sort();

  // Build traces with countries blank if articles = 0
  const plotTraces = uniqueCancers.map((cancerType) => {
    const categoryData = data.filter(d => d.Cancer === cancerType);
    const color = colorMapping[cancerType] || '#999999';

    const zValues = categoryData.map(d => {
      const articles = parseFloat(d.Articles);
      return articles > 0 ? articles : null; // leave blank if 0
    });

    return {
      type: "choropleth",
      locations: categoryData.map(d => countryCodeMap[d.Country]),
      z: zValues,
      text: categoryData.map(d => d.Country),
      name: cancerType,
      showlegend: true,
      showscale: false,
      marker: { line: { color: "black", width: 0.5 } },
      locationmode: "ISO-3",
      colorscale: [[0, color], [1, color]],
      hovertemplate: `<b>%{text}</b><br>Most Studied Cancer: ${cancerType}<br>Articles: %{z:d}<extra></extra>`,
      hoverlabel: {
        bordercolor: 'rgba(0, 0, 0, 0.7)',
        bgcolor: 'rgba(255, 255, 255, 0.7)',
        font: { color: 'black' }
      },
    };
  });

  const config = {
    modeBarButtonsToRemove: [
      'zoomInGeo', 'zoomOutGeo', 'panGeo', 'select2d', 'lasso2d',
      'autoScaleGeo', 'hoverClosestGeo', 'hoverCompareGeo',
      'zoom2d', 'pan2d', 'resetViews', 'select', 'lasso',
      'hoverClosest', 'hoverCompare', 'toggleSpikelines', 'sendDataToCloud',
      "toImage"
    ],
    displaylogo: false,
    responsive: true,
    scrollZoom: true,
  };

  const plotTitle =
    windowWidth <= 1080
      ? "Most studied cancer <b>per country</b>"
      : "Most studied cancer <b>per country</b>";

  const titleStyle = {
    textAlign: "center",
    marginBottom: windowWidth <= 1080 ? "-1rem" : "-2rem",
    fontWeight: "normal",
    fontSize: windowWidth <= 1080 ? "16px" : "20px",
    color: "black",
    position: "relative",
    zIndex: 2,
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
        data={plotTraces}
        layout={{
          autosize: true,
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
          margin: { t: windowWidth <= 1080 ? 0 : 0, b: 40, l: 10, r: 10 },
          paper_bgcolor: "#f6f8fa",
          plot_bgcolor: "#f6f8fa",
          showlegend: true,
          legend: {
            x: 0.5,
            y: -0.02,
            xanchor: "center",
            yanchor: "top",
            orientation: "h",
            bgcolor: "rgba(255, 255, 255, 0)",
            font: { color: "black" },
          },
          legenditemclick: false,
          legenditemdoubleclick: false,
        }}
        config={config}
        useResizeHandler={true}
        style={{ width: "100%", height: windowWidth <= 1080 ? 400 : 620 }}
      />
    </div>
  );
};

export default MapMostStudied;
