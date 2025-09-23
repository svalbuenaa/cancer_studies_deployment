import React, { useEffect, useState } from "react";
import Plot from "react-plotly.js";

const ScatterASRArticlesCancerCountry = ({ csvPath }) => {
  const [data, setData] = useState([]);
  const [uniqueCountries, setUniqueCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState("Switzerland");
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [sizeFactor, setSizeFactor] = useState(1.2);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(csvPath);
        const text = await response.text();
        const lines = text.split("\n").filter(line => line.trim() !== "");
        if (lines.length > 1) {
          const header = lines[0].split(",").map(h => h.trim());
          const parsedData = lines.slice(1)
            .map(line => {
              const values = line.split(",");
              if (values.length === header.length) {
                return header.reduce((obj, key, index) => {
                  obj[key] = values[index].trim();
                  return obj;
                }, {});
              }
              return null;
            })
            .filter(d => d && d.Cancer && d.Country && d.Articles && d.ASR);

          setData(parsedData);
          const countries = [...new Set(parsedData.map(d => d.Country))].sort();
          setUniqueCountries(countries);
          if (countries.includes("Switzerland")) setSelectedCountry("Switzerland");
          else if (countries.length > 0 && !selectedCountry) setSelectedCountry(countries[0]);
        }
      } catch (error) {
        console.error("Error fetching CSV:", error);
      }
    };
    fetchData();
  }, [csvPath]);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      const newSize = Math.min(window.innerWidth, window.innerHeight) * 0.75;
      setDimensions({ width: newSize, height: newSize });
      setSizeFactor(window.innerWidth < 768 ? 1.2 : 1.4);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleCountryChange = (event) => setSelectedCountry(event.target.value);

  const filteredData = data.filter(d => d.Country === selectedCountry);
  const maxValue = Math.max(...filteredData.map(d => parseFloat(d.ASR)), ...filteredData.map(d => parseFloat(d.Articles)));
  const sortedByArticles = [...filteredData].sort((a, b) => parseFloat(b.Articles) - parseFloat(a.Articles));
  const top3 = sortedByArticles.slice(0, 3);
  const others = sortedByArticles.slice(3);
  const formatCancerName = (name) => name.replace(/ /g, "<br>");

  const topTrace = {
    x: top3.map(d => parseFloat(d.ASR)),
    y: top3.map(d => parseFloat(d.Articles)),
    text: top3.map(d => formatCancerName(d.Cancer)),
    customdata: top3.map(d => d.Cancer),
    mode: "markers+text",
    type: "scatter",
    textposition: "top center",
    textfont: { color: "black" },
    marker: { size: 14, color: top3.map(d => colorMapping[d.Cancer] || '#d3d3d3'), opacity: 0.9, line: { width: 1, color: "#333" } },
    hovertemplate: `<b>Country:</b> ${selectedCountry}<br><b>Cancer:</b> %{customdata}<br><b>Incidence:</b> %{x:.2f}%<br><b>Articles:</b> %{y:.2f}%<extra></extra>`,
  };

  const othersTrace = {
    x: others.map(d => parseFloat(d.ASR)),
    y: others.map(d => parseFloat(d.Articles)),
    text: others.map(() => ""),
    customdata: others.map(d => d.Cancer),
    mode: "markers",
    type: "scatter",
    marker: { size: 10, color: "grey", opacity: 0.8, line: { width: 1, color: "#333" } },
    hovertemplate: `<b>Country:</b> ${selectedCountry}<br><b>Cancer:</b> %{customdata}<br><b>Incidence:</b> %{x:.2f}%<br><b>Articles:</b> %{y:.2f}%<extra></extra>`,
    hoverlabel: { bordercolor: 'rgba(0,0,0,0.7)', bgcolor: 'rgba(255,255,255,0.7)', font: { color: 'black' } },
  };

  const config = { responsive: true, displaylogo: false, modeBarButtonsToRemove: ["zoom2d","pan2d","select2d","lasso2d","zoomIn2d","zoomOut2d","autoScale2d","hoverClosestCartesian","hoverCompareCartesian"] };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
      <Plot
        data={[topTrace, othersTrace]}
        layout={{
          title: {
            text: windowWidth < 768
              ? `Cancer research vs incidence<br>in <b>${selectedCountry}</b>`
              : `Cancer research vs incidence in <b>${selectedCountry}</b>`,
            y: windowWidth < 768 ? 0.95 : 0.95,
            x: 0.5,
            xanchor: "center",
            font: { size: windowWidth < 768 ? 14 : 18, color: "black" },
            automargin: true
          },
          xaxis: { title: { text: "Incidence (% of all new cancer cases)", font: { color: "black", size: 16 }, automargin: true }, showgrid: true, zeroline: false, linecolor: "black", linewidth: 1.5, gridcolor: "rgba(0,0,0,0.075)", tickfont: { color: "black" }, ticksuffix: "%", range: [maxValue * -0.08, maxValue * 1.08], dtick: 5 },
          yaxis: { title: { text: "Studies (% of all cancer studies)", font: { color: "black", size: 16 }, automargin: true }, showgrid: true, zeroline: false, linecolor: "black", linewidth: 1.5, gridcolor: "rgba(0,0,0,0.075)", tickfont: { color: "black" }, ticksuffix: "%", range: [maxValue * -0.08, maxValue * 1.08], dtick: 5, scaleanchor: 'x', scaleratio: 1 },
          margin: { t: 60 * sizeFactor, b: 60, l: 80, r: 40 },
          paper_bgcolor: "#f6f8fa",
          plot_bgcolor: "#f6f8fa",
          hovermode: "closest",
          showlegend: false,
          width: dimensions.width * sizeFactor,
          height: dimensions.height * sizeFactor,
          shapes: [{ type: 'line', xref: 'x', yref: 'y', x0: maxValue * -0.08, y0: maxValue * -0.08, x1: maxValue * 1.08, y1: maxValue * 1.08, line: { color: '#808080', width: 2, dash: 'dash', opacity: 0.5 } }],
        }}
        config={config}
      />
      <div style={{ marginTop: "20px", color: "black", textAlign: "center" }}>
        <label htmlFor="country-select" style={{ marginRight: "10px" }}>Country:</label>
        <select id="country-select" onChange={handleCountryChange} value={selectedCountry} style={{ padding: "5px 10px", borderRadius: "5px", border: "1px solid black", backgroundColor: "white", color: "black" }}>
          {uniqueCountries.map(country => <option key={country} value={country}>{country}</option>)}
        </select>
      </div>
    </div>
  );
};

export default ScatterASRArticlesCancerCountry;
