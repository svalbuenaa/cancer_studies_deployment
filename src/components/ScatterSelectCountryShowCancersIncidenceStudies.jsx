import React, { useEffect, useState, useMemo } from "react";
import Plot from "react-plotly.js";

const ScatterSelectCountryShowCancersIncidenceStudies = ({ csvPath }) => {
  const [data, setData] = useState([]);
  const [uniqueCountries, setUniqueCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState("Switzerland");
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [plotSize, setPlotSize] = useState(600);

  const colorMapping = {
    'Breast cancer': '#377eb8', 'Prostate cancer': '#4daf4a', 'Lung cancer': '#984ea3',
    'Colorectal cancer': '#66c2a5', 'Liver cancer': '#f781bf', 'Stomach cancer': '#8da0cb',
    'Cervical cancer': '#e78ac3', 'Leukemia': '#a65628', 'Esophageal cancer': '#ffbaba',
    'Skin cancer': '#ff7f00', 'Anal cancer': '#b15928', 'Brain cancer': '#1f78b4',
    'Mesothelioma': '#33a02c', 'Kidney cancer': '#6a3d9a', 'Multiple myeloma': '#e31a1c',
    'Laryngeal cancer': '#fdbf6f', 'Ovarian cancer': '#cab2d6', 'Colon cancer': '#ffff99',
    'Penile cancer': '#a6cee3',
  };

  // Fetch CSV
  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        const response = await fetch(csvPath);
        const text = await response.text();
        const [headerLine, ...lines] = text.split("\n").filter(l => l.trim() !== "");
        if (!headerLine) return;

        const header = headerLine.split(",").map(h => h.trim());
        const parsedData = lines
          .map(line => {
            const values = line.split(",");
            if (values.length !== header.length) return null;
            const obj = {};
            for (let i = 0; i < header.length; i++) obj[header[i]] = values[i].trim();
            return obj;
          })
          .filter(d => d && d.Cancer && d.Country && d.Articles && d.ASR)
          .map(d => ({ ...d, ASR: parseFloat(d.ASR), Articles: parseFloat(d.Articles) }));

        if (isMounted) {
          setData(parsedData);
          const countries = Array.from(new Set(parsedData.map(d => d.Country))).sort();
          setUniqueCountries(countries);
          if (!selectedCountry) setSelectedCountry(countries[0] || "");
        }
      } catch (err) {
        console.error("Error fetching CSV:", err);
      }
    };
    fetchData();
    return () => { isMounted = false; };
  }, [csvPath, selectedCountry]);

  // Responsive plot size with debounce
  useEffect(() => {
    let timeout;
    const handleResize = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        setWindowWidth(window.innerWidth);
        const size = Math.min(window.innerWidth, window.innerHeight) * (window.innerWidth > 1080 ? 0.6 : 1);
        setPlotSize(size);
      }, 50);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => {
      clearTimeout(timeout);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const handleCountryChange = (e) => setSelectedCountry(e.target.value);

  const filteredData = useMemo(() => data.filter(d => d.Country === selectedCountry), [data, selectedCountry]);
  const sortedByArticles = useMemo(() => [...filteredData].sort((a, b) => b.Articles - a.Articles), [filteredData]);
  const top3 = useMemo(() => sortedByArticles.slice(0, 3), [sortedByArticles]);
  const others = useMemo(() => sortedByArticles.slice(3), [sortedByArticles]);

  const topMarkerSize = windowWidth <= 1080 ? 10 : 12;  // slightly smaller
  const othersMarkerSize = windowWidth <= 1080 ? 7 : 8;  // slightly smaller

  const maxValue = useMemo(() => {
    const allValues = filteredData.flatMap(d => [d.ASR, d.Articles]);
    return Math.max(...allValues, 1);
  }, [filteredData]);

  const topTrace = useMemo(() => ({
    x: top3.map(d => d.ASR),
    y: top3.map(d => d.Articles),
    text: top3.map(d => d.Cancer.replace(/ /g, "<br>")),
    customdata: top3.map(d => d.Cancer),
    mode: "markers+text",
    type: "scatter",
    textposition: "top center",
    textfont: { color: "black", size: windowWidth <= 1080 ? 9 : 12 },
    marker: { size: topMarkerSize, color: top3.map(d => colorMapping[d.Cancer] || '#d3d3d3'), opacity: 0.9, line: { width: 1, color: "#333" } },
    hovertemplate: `<b>Country:</b> ${selectedCountry}<br><b>Cancer:</b> %{customdata}<br><b>Incidence:</b> %{x:.2f}%<br><b>Articles:</b> %{y:.2f}%<extra></extra>`,
  }), [top3, topMarkerSize, windowWidth, selectedCountry]);

  const othersTrace = useMemo(() => ({
    x: others.map(d => d.ASR),
    y: others.map(d => d.Articles),
    text: others.map(() => ""),
    customdata: others.map(d => d.Cancer),
    mode: "markers",
    type: "scatter",
    marker: { size: othersMarkerSize, color: "grey", opacity: 0.8, line: { width: 1, color: "#333" } },
    hovertemplate: `<b>Country:</b> ${selectedCountry}<br><b>Cancer:</b> %{customdata}<br><b>Incidence:</b> %{x:.2f}%<br><b>Articles:</b> %{y:.2f}%<extra></extra>`,
    hoverlabel: { bordercolor: 'rgba(0,0,0,0.7)', bgcolor: 'rgba(255,255,255,0.7)', font: { color: 'black' } },
  }), [others, othersMarkerSize, selectedCountry]);

  const config = useMemo(() => ({
    responsive: true,
    displaylogo: false,
    modeBarButtonsToRemove: ["zoom2d","pan2d","select2d","lasso2d","zoomIn2d","zoomOut2d","autoScale2d","hoverClosestCartesian","hoverCompareCartesian"]
  }), []);

  const plotTitle = windowWidth <= 1080
    ? <>Cancer research vs incidence<br />in <b>{selectedCountry}</b></>
    : <>Cancer research vs incidence in <b>{selectedCountry}</b></>;

  const titleStyle = { textAlign: "center", marginBottom: "0rem", fontWeight: "normal", fontSize: windowWidth <= 1080 ? "16px" : "20px", color: "black" };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
      <h2 style={titleStyle}>{plotTitle}</h2>

      <div style={{ width: plotSize, height: plotSize }}>
        <Plot
          data={[topTrace, othersTrace]}
          layout={{
            xaxis: { title: { text: "Incidence (% of all new cancer cases)", font: { color: "black", size: windowWidth <= 1080 ? 12 : 16 }, automargin: true }, showgrid: true, zeroline: false, linecolor: "black", linewidth: 1.5, gridcolor: "rgba(0,0,0,0.075)", ticksuffix: "%", range: [maxValue * -0.08, maxValue * 1.08], dtick: 5 },
            yaxis: { title: { text: "Studies (% of all cancer studies)", font: { color: "black", size: windowWidth <= 1080 ? 12 : 16 }, automargin: true }, showgrid: true, zeroline: false, linecolor: "black", linewidth: 1.5, gridcolor: "rgba(0,0,0,0.075)", ticksuffix: "%", range: [maxValue * -0.08, maxValue * 1.08], dtick: 5, scaleanchor: 'x', scaleratio: 1 },
            margin: { t: 60, b: 60, l: 80, r: 40 },
            paper_bgcolor: "#f6f8fa",
            plot_bgcolor: "#f6f8fa",
            hovermode: "closest",
            showlegend: false,
            width: plotSize,
            height: plotSize,
            shapes: [{ type: 'line', xref: 'x', yref: 'y', x0: maxValue * -0.08, y0: maxValue * -0.08, x1: maxValue * 1.08, y1: maxValue * 1.08, line: { color: '#808080', width: 2, dash: 'dash', opacity: 0.5 } }],
          }}
          config={config}
          useResizeHandler
          style={{ width: "100%", height: "100%" }}
        />
      </div>

      <div style={{ marginTop: "20px", color: "black", textAlign: "center" }}>
        <label htmlFor="country-select" style={{ marginRight: "10px" }}>Country:</label>
        <select
          id="country-select"
          onChange={handleCountryChange}
          value={selectedCountry}
          style={{ padding: "5px 10px", borderRadius: "5px", border: "1px solid black", backgroundColor: "white", color: "black" }}
        >
          {uniqueCountries.map(country => <option key={country} value={country}>{country}</option>)}
        </select>
      </div>
    </div>
  );
};

export default ScatterSelectCountryShowCancersIncidenceStudies;
