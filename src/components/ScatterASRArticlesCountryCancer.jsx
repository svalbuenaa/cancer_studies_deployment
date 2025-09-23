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

const ScatterASRArticlesCountryCancer = ({ csvPath, selectedCancer, setSelectedCancer }) => {
  const [data, setData] = useState([]);
  const [uniqueCancers, setUniqueCancers] = useState([]);
  const [size, setSize] = useState(600);
  const [sizeFactor, setSizeFactor] = useState(1.1); // dynamic factor

  // Fetch CSV data
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
                const obj = header.reduce((acc, key, index) => {
                  acc[key] = values[index].trim();
                  return acc;
                }, {});
                obj.Norm_articles = parseFloat(obj["Norm_articles"]);
                obj.ASR = parseFloat(obj["ASR"]);
                return obj;
              }
              return null;
            })
            .filter((d) => d && d.Cancer && d.Country && !isNaN(d.Norm_articles) && !isNaN(d.ASR));

          setData(parsedData);
          const cancers = [...new Set(parsedData.map((d) => d.Cancer))].sort();
          setUniqueCancers(cancers);
          if (!selectedCancer && cancers.length > 0) setSelectedCancer(cancers[0]);
        }
      } catch (error) {
        console.error("Error fetching CSV:", error);
      }
    };
    fetchData();
  }, [csvPath]);

  // Responsive square plot and dynamic factor
  useEffect(() => {
    const handleResize = () => {
      const viewportSize = Math.min(window.innerWidth, window.innerHeight) * 0.8;
      setSize(viewportSize);

      // adjust factor depending on screen width
      if (window.innerWidth < 768) {
        setSizeFactor(1.1); // small screens
      } else {
        setSizeFactor(1.3); // larger screens
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleCancerChange = (event) => setSelectedCancer(event.target.value);

  const filteredData = useMemo(() => data.filter((d) => d.Cancer === selectedCancer), [data, selectedCancer]);
  const sortedByArticles = useMemo(() => [...filteredData].sort((a, b) => b.Norm_articles - a.Norm_articles), [filteredData]);
  const top3 = useMemo(() => sortedByArticles.slice(0, 3), [sortedByArticles]);
  const others = useMemo(() => sortedByArticles.slice(3), [sortedByArticles]);

  const getCountryColor = (country) => countryColors[country] || defaultColor;

  const topTrace = {
    x: top3.map((d) => d.ASR),
    y: top3.map((d) => d.Norm_articles),
    text: top3.map((d) => formatCountryText(d.Country)),
    customdata: top3.map((d) => d.Country),
    mode: "markers+text",
    type: "scatter",
    textposition: "top center",
    textfont: { color: "black" },
    marker: { size: 14, color: top3.map((d) => getCountryColor(d.Country)), opacity: 0.9, line: { width: 1, color: "#333" } },
    hovertemplate: `<b>Country:</b> %{customdata}<br><b>Cancer:</b> ${selectedCancer}<br><b>Incidence:</b> %{x} per 100000<br><b>Norm Articles:</b> %{y} per 1M<extra></extra>`,
    showlegend: false,
  };

  const othersTrace = {
    x: others.map((d) => d.ASR),
    y: others.map((d) => d.Norm_articles),
    customdata: others.map((d) => d.Country),
    mode: "markers",
    type: "scatter",
    marker: { size: 10, color: defaultColor, opacity: 0.8, line: { width: 1, color: "#333" } },
    hovertemplate: `<b>Country:</b> %{customdata}<br><b>Cancer:</b> ${selectedCancer}<br><b>Incidence:</b> %{x} per 100000<br><b>Norm Articles:</b> %{y} per 1M<extra></extra>`,
    hoverlabel: { bordercolor: "rgba(0,0,0,0.7)", bgcolor: "rgba(255,255,255,0.7)", font: { color: "black" } },
    showlegend: false,
  };

  const config = { responsive: true, displaylogo: false, modeBarButtonsToRemove: ["zoom2d","pan2d","select2d","lasso2d","zoomIn2d","zoomOut2d","autoScale2d","hoverClosestCartesian","hoverCompareCartesian"] };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
      <Plot
        data={[topTrace, othersTrace]}
        layout={{
          title: { text: `Incidence vs normalized number of studies for <b>${selectedCancer}</b>`, y: 0.98, x: 0.5, xanchor: "center", font: { size: 18, color: "black" }, automargin: true },
          xaxis: { title: { text: "Incidence per 100000", font: { color: "black", size: 16 }, automargin: true }, showgrid: true, zeroline: false, linecolor: "black", linewidth: 1.5, gridcolor: "rgba(0,0,0,0.075)", tickfont: { color: "black" } },
          yaxis: { title: { text: "Normalized studies (per 1M inhabitants)", font: { color: "black", size: 16 }, automargin: true }, showgrid: true, zeroline: false, linecolor: "black", linewidth: 1.5, gridcolor: "rgba(0,0,0,0.075)", tickfont: { color: "black" }, tickformat: "~s" },
          margin: { t: 60, b: 60, l: 80, r: 40 },
          paper_bgcolor: "#f6f8fa",
          plot_bgcolor: "#f6f8fa",
          hovermode: "closest",
          showlegend: false,
          width: size * sizeFactor,
          height: size * sizeFactor,
        }}
        config={config}
      />
      <div style={{ marginTop: "20px", color: "black", textAlign: "center" }}>
        <label htmlFor="cancer-select" style={{ marginRight: "10px" }}>Cancer:</label>
        <select id="cancer-select" onChange={handleCancerChange} value={selectedCancer} style={{ padding: "5px 10px", borderRadius: "5px", border: "1px solid black", backgroundColor: "white", color: "black" }}>
          {uniqueCancers.map((cancer) => <option key={cancer} value={cancer}>{cancer}</option>)}
        </select>
      </div>
    </div>
  );
};

export default ScatterASRArticlesCountryCancer;
