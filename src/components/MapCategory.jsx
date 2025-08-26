import React, { useEffect, useState } from "react";
import Plot from "react-plotly.js";
import Papa from "papaparse";

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

const MapCategory = ({ csvPath }) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    Papa.parse(csvPath, {
      download: true,
      header: true,
      complete: (results) => {
        const validData = results.data.filter(
          d => d.Cancer && d.ASR && !isNaN(parseFloat(d.ASR))
        );
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

  const uniqueCancers = [...new Set(data.map(d => d.Cancer))].sort();

  const plotTraces = uniqueCancers.map(cancerType => {
    const categoryData = data.filter(d => d.Cancer === cancerType);
    const color = colorMapping[cancerType] || "#999999";

    // Trick: use two different z values to force legend display
    const zValues = categoryData.map((_, i) => i % 2); // 0,1,0,1,...

    return {
      type: "choropleth",
      locations: categoryData.map(d => d.Country),
      z: zValues,
      text: categoryData.map(d => d.Country),
      name: cancerType,
      showscale: false,
      showlegend: true,
      marker: { line: { color: "white", width: 0.5 } },
      locationmode: "country names",
      colorscale: [[0, color], [1, color]], // single-color scale
      hovertemplate:
        `<b>%{text}</b><br>` +
        `Predominant Cancer: ${cancerType}<br>` +
        `<extra></extra>`,
    };
  });

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
    <div style={{ position: "relative" }}>
      <Plot
        data={plotTraces}
        layout={{
          title: {
            text: "Predominant Cancer Type per Country",
            x: 0.5,
            xanchor: "center",
            font: { size: 22, color: "white" },
            y: 0.96,
          },
          geo: {
            projection: { type: "natural earth" },
            showframe: false,
            showcoastlines: true,
            coastlinecolor: "gray",
            oceancolor: "#242424",
            landcolor: "#242424",
            bgcolor: "#242424",
          },
          margin: { t: 40, b: 100, l: 40, r: 40 },
          paper_bgcolor: "#242424",
          plot_bgcolor: "#242424",
          autosize: true,
          showlegend: true,
          legend: {
            x: 0.5,
            y: -0.02,
            xanchor: "center",
            yanchor: "top",
            orientation: "h",
            bgcolor: "rgba(255, 255, 255, 0)",
            font: { color: "white" },
          },
          legenditemclick: false,
          legenditemdoubleclick: false,
        }}
        config={config}
        useResizeHandler={true}
        className="plotly-responsive-plot"
      />
      <style jsx>{`
        .modebar {
          top: auto !important;
          bottom: -50px !important;
          right: 7% !important;
          transform: translateX(50%);
        }
      `}</style>
    </div>
  );
};

export default MapCategory;
