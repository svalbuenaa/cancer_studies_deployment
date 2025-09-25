import React, { useEffect, useState, useMemo } from "react";
import Plot from "react-plotly.js";

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
  "Belgium": "#c5b0d5",
  "Norway": "#1f9984",
  "Denmark": "#ffb347",
  "Finland": "#2e8b57",
  "Iceland": "#e9967a",
  "Austria": "#20b2aa",
  "Ireland": "#cd5c5c",
  "Luxembourg": "#9370db",
  "Portugal": "#4682b4",
  "Greece": "#daa520",
  "Poland": "#6495ed",
  "Czechia": "#ff6347",
  "Hungary": "#3cb371",
  "Slovakia": "#8b4513",
  "Slovenia": "#ff69b4",
  "Estonia": "#708090",
  "Latvia": "#40e0d0",
  "Lithuania": "#b8860b",
  "Israel": "#7fffd4",
  "Singapore": "#dc143c",
  "New Zealand": "#556b2f",
};
const defaultColor = "grey";
const formatCountryText = (country) => country.replace(/ /g, "<br>");

const ScatterSelectCancerShowCountriesIncidenceStudies = ({
  csvPath,
  selectedCancer,
  setSelectedCancer,
}) => {
  const [data, setData] = useState([]);
  const [uniqueCancers, setUniqueCancers] = useState([]);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [plotSize, setPlotSize] = useState(600);

  // Fetch CSV once
  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        const response = await fetch(csvPath);
        const text = await response.text();
        const [headerLine, ...lines] = text.split("\n").filter((l) => l.trim() !== "");
        if (!headerLine) return;

        const header = headerLine.split(",").map((h) => h.trim());
        const parsedData = lines
          .map((line) => {
            const values = line.split(",");
            if (values.length !== header.length) return null;
            const obj = {};
            for (let i = 0; i < header.length; i++) obj[header[i]] = values[i].trim();
            obj.Norm_articles = parseFloat(obj["Norm_articles"]);
            obj.ASR = parseFloat(obj["ASR"]);
            return obj;
          })
          .filter(
            (d) =>
              d &&
              d.Cancer &&
              d.Country &&
              !isNaN(d.Norm_articles) &&
              !isNaN(d.ASR)
          );

        if (isMounted) {
          setData(parsedData);
          const cancers = Array.from(new Set(parsedData.map((d) => d.Cancer))).sort();
          setUniqueCancers(cancers);
          if ((selectedCancer === undefined || selectedCancer === null) && cancers.length > 0) {
            setSelectedCancer(cancers[0]);
          }
        }
      } catch (err) {
        console.error("Error fetching CSV:", err);
      }
    };
    fetchData();
    return () => { isMounted = false; };
  }, [csvPath, selectedCancer, setSelectedCancer]);

  // Responsive plot size with debounce
  useEffect(() => {
    let timeout;
    const handleResize = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        setWindowWidth(window.innerWidth);
        const size = Math.min(window.innerWidth, window.innerHeight) * 0.6;
        setPlotSize(size);
      }, 50); // 50ms debounce
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => {
      clearTimeout(timeout);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const handleCancerChange = (e) => setSelectedCancer(e.target.value);

  const filteredData = useMemo(
    () => data.filter((d) => d.Cancer === selectedCancer),
    [data, selectedCancer]
  );

  const sortedByArticles = useMemo(
    () => [...filteredData].sort((a, b) => b.Norm_articles - a.Norm_articles),
    [filteredData]
  );

  const top3 = useMemo(() => sortedByArticles.slice(0, 3), [sortedByArticles]);
  const others = useMemo(() => sortedByArticles.slice(3), [sortedByArticles]);

  const getCountryColor = (country) => countryColors[country] || defaultColor;
  const topMarkerSize = windowWidth <= 1080 ? 10 : 14;
  const othersMarkerSize = windowWidth <= 1080 ? 7 : 10;

  const topTrace = useMemo(() => ({
    x: top3.map((d) => d.ASR),
    y: top3.map((d) => d.Norm_articles),
    text: top3.map((d) => formatCountryText(d.Country)),
    customdata: top3.map((d) => d.Country),
    mode: "markers+text",
    type: "scatter",
    textposition: "top center",
    textfont: { color: "black", size: windowWidth <= 1080 ? 9 : 12 },
    marker: { size: topMarkerSize, color: top3.map((d) => getCountryColor(d.Country)), opacity: 0.9, line: { width: 1, color: "#333" } },
    hovertemplate: `<b>Country:</b> %{customdata}<br><b>Cancer:</b> ${selectedCancer}<br><b>Incidence:</b> %{x} per 100000<br><b>Norm Articles:</b> %{y} per 1M<extra></extra>`,
    showlegend: false,
  }), [top3, windowWidth, selectedCancer]);

  const othersTrace = useMemo(() => ({
    x: others.map((d) => d.ASR),
    y: others.map((d) => d.Norm_articles),
    customdata: others.map((d) => d.Country),
    mode: "markers",
    type: "scatter",
    marker: { size: othersMarkerSize, color: defaultColor, opacity: 0.8, line: { width: 1, color: "#333" } },
    hovertemplate: `<b>Country:</b> %{customdata}<br><b>Cancer:</b> ${selectedCancer}<br><b>Incidence:</b> %{x} per 100000<br><b>Norm Articles:</b> %{y} per 1M<extra></extra>`,
    showlegend: false,
  }), [others, othersMarkerSize, selectedCancer]);

  const config = {
    responsive: true,
    displaylogo: false,
    modeBarButtonsToRemove: [
      "zoom2d","pan2d","select2d","lasso2d","zoomIn2d","zoomOut2d",
      "autoScale2d","hoverClosestCartesian","hoverCompareCartesian"
    ]
  };

  const plotTitle = windowWidth <= 1080
    ? <>Incidence vs normalized<br />number of studies for <b>{selectedCancer}</b></>
    : <>Incidence vs normalized number of studies for <b>{selectedCancer}</b></>;

  const titleStyle = { textAlign: "center", marginBottom: "0rem", fontWeight: "normal", fontSize: windowWidth <= 1080 ? "16px" : "20px", color: "black" };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <h2 style={titleStyle}>{plotTitle}</h2>

      <div style={{ width: plotSize, height: plotSize }}>
        <Plot
          data={[topTrace, othersTrace]}
          layout={{
            xaxis: {
              title: { text: "Incidence per 100000", font: { color: "black", size: windowWidth <= 1080 ? 12 : 16 }, automargin: true },
              showgrid: true, zeroline: false, linecolor: "black", linewidth: 1.5, gridcolor: "rgba(0,0,0,0.075)",
              tickfont: { color: "black", size: windowWidth <= 1080 ? 9 : 14 }
            },
            yaxis: {
              title: { text: "Normalized studies (per 1M inhabitants)", font: { color: "black", size: windowWidth <= 1080 ? 12 : 16 }, automargin: true },
              showgrid: true, zeroline: false, linecolor: "black", linewidth: 1.5, gridcolor: "rgba(0,0,0,0.075)",
              tickfont: { color: "black", size: windowWidth <= 1080 ? 9 : 14 },
              tickformat: "~s"
            },
            margin: { t: 20, b: 60, l: 70, r: 40 },
            paper_bgcolor: "#f6f8fa",
            plot_bgcolor: "#f6f8fa",
            hovermode: "closest",
            showlegend: false,
            autosize: true,
          }}
          config={config}
          useResizeHandler
          style={{ width: "100%", height: "100%" }}
        />
      </div>

      <div style={{ marginTop: "20px", textAlign: "center", color: "black" }}>
        <label htmlFor="cancer-select" style={{ marginRight: "10px" }}>Cancer:</label>
        <select
          id="cancer-select"
          onChange={handleCancerChange}
          value={selectedCancer}
          style={{ padding: "5px 10px", borderRadius: "5px", border: "1px solid black", backgroundColor: "white", color: "black" }}
        >
          {uniqueCancers.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
    </div>
  );
};

export default ScatterSelectCancerShowCountriesIncidenceStudies;
