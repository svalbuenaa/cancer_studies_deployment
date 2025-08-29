import React, { useEffect, useState } from "react";
import Plot from "react-plotly.js";

const ScatterASRArticlesCancerCountry = ({ csvPath }) => {
  const [data, setData] = useState([]);
  const [uniqueCountries, setUniqueCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState("Switzerland");

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
            .filter((d) => d && d.Cancer && d.Country && d.Articles && d.ASR);

          setData(parsedData);

          const countries = [...new Set(parsedData.map((d) => d.Country))].sort();
          setUniqueCountries(countries);

          if (countries.includes("Switzerland")) {
            setSelectedCountry("Switzerland");
          } else if (countries.length > 0 && !selectedCountry) {
            setSelectedCountry(countries[0]);
          }
        }
      } catch (error) {
        console.error("Error fetching CSV:", error);
      }
    };

    fetchData();
  }, [csvPath]);

  const handleCountryChange = (event) => {
    setSelectedCountry(event.target.value);
  };

  const filteredData = data.filter((d) => d.Country === selectedCountry);

  // Sort cancers by number of studies
  const sortedByArticles = [...filteredData].sort(
    (a, b) => parseInt(b.Articles) - parseInt(a.Articles)
  );
  const top5 = sortedByArticles.slice(0, 5);
  const others = sortedByArticles.slice(5);

  // Format cancer names with line breaks for multiple words
  const formatCancerName = (name) => name.replace(/ /g, "<br>");

  // Top 5 cancers → colored, with labels
  const topTrace = {
    x: top5.map((d) => parseFloat(d.ASR)),
    y: top5.map((d) => parseInt(d.Articles)),
    text: top5.map((d) => formatCancerName(d.Cancer)),
    mode: "markers+text",
    type: "scatter",
    textposition: "top center",
    textfont: { color: "white" },
    marker: {
      size: 14,
      color: ["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd"],
      opacity: 0.9,
    },
    hovertemplate:
      "<b>Country:</b> " + selectedCountry + "<br>" +
      "<b>Cancer:</b> %{text}<br>" +
      "<b>Incidence:</b> %{x}<br>" +
      "<b>Articles:</b> %{y}<extra></extra>",
    name: "Top 5 cancers",
  };

  // Other cancers → grey, no labels (only hover)
  const othersTrace = {
    x: others.map((d) => parseFloat(d.ASR)),
    y: others.map((d) => parseInt(d.Articles)),
    text: others.map((d) => d.Cancer),
    mode: "markers",
    type: "scatter",
    marker: {
      size: 10,
      color: "grey",
      opacity: 0.5,
    },
    hovertemplate:
      "<b>Country:</b> " + selectedCountry + "<br>" +
      "<b>Cancer:</b> %{text}<br>" +
      "<b>ASR:</b> %{x}<br>" +
      "<b>Articles:</b> %{y}<extra></extra>",
    name: "Other cancers",
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
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
      }}
    >
      <Plot
        data={[topTrace, othersTrace]}
        layout={{
          title: {
            text: `Cancer research vs incidence in <b>${selectedCountry}</b>`,
            x: 0.5,
            xanchor: "center",
            font: { size: 22, color: "white" },
          },
          xaxis: {
            title: { text: "Incidence", font: { color: "white", size: 16 } },
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
              line: {
                color: '#808080', // Grey color
                width: 2,
                dash: 'dash',
                opacity: 0.5 // Added transparency
              }
            }
          ]
        }}
        config={config}
      />

      {/* Country Selector */}
      <div style={{ marginTop: "20px", color: "white", textAlign: "center" }}>
        <label htmlFor="country-select" style={{ marginRight: "10px" }}>Country:</label>
        <select
          id="country-select"
          onChange={handleCountryChange}
          style={{
            padding: "5px 10px",
            borderRadius: "5px",
            border: "1px solid white",
            backgroundColor: "#333",
            color: "white",
          }}
          value={selectedCountry}
        >
          {uniqueCountries.map((country) => (
            <option key={country} value={country}>
              {country}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default ScatterASRArticlesCancerCountry;