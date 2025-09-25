import React, { useEffect, useState, useMemo } from "react";
import Plot from "react-plotly.js";

const HistogramSelectCancerShowTopCountries = ({ csvPath }) => {
  const [data, setData] = useState([]);
  const [uniqueCancers, setUniqueCancers] = useState([]);
  const [selectedCancer, setSelectedCancer] = useState("Breast cancer");
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [dataMap, setDataMap] = useState({});
  const [totalPerCountry, setTotalPerCountry] = useState({});
  const [years, setYears] = useState([]);

  const colors = ["#FF5733", "#19ad17", "#33e7ff", "#FF33A1", "#FFC300"];

  useEffect(() => {
    const handleResize = () => {
      clearTimeout(window.resizeTimeout);
      window.resizeTimeout = setTimeout(() => setWindowWidth(window.innerWidth), 150);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
            .filter(d => d && d.Year && d.Articles && d.Country && d.Cancer);

          setData(parsedData);
          const cancers = [...new Set(parsedData.map(d => d.Cancer))].sort();
          setUniqueCancers(cancers);

          if (cancers.includes("Breast cancer")) setSelectedCancer("Breast cancer");
          else if (!selectedCancer && cancers.length > 0) setSelectedCancer(cancers[0]);
        }
      } catch (err) {
        console.error("Error fetching CSV:", err);
      }
    };
    fetchData();
  }, [csvPath]);

  useEffect(() => {
    if (!data || data.length === 0) return;

    const map = {};
    const total = {};
    const yearSet = new Set();

    data.forEach(d => {
      const { Cancer: ca, Country: c, Year: y, Articles } = d;
      const val = parseInt(Articles);
      yearSet.add(y);
      if (!map[ca]) map[ca] = {};
      if (!map[ca][c]) map[ca][c] = {};
      map[ca][c][y] = val;
    });

    Object.keys(map).forEach(cancer => {
      total[cancer] = {};
      Object.keys(map[cancer]).forEach(country => {
        total[cancer][country] = Object.values(map[cancer][country]).reduce((a, b) => a + b, 0);
      });
    });

    setDataMap(map);
    setTotalPerCountry(total);
    setYears([...yearSet].sort());
  }, [data]);

  const handleCancerChange = (event) => setSelectedCancer(event.target.value);

  const { plotData, annotations } = useMemo(() => {
    if (!selectedCancer || !dataMap[selectedCancer]) return { plotData: [], annotations: [] };

    const topCountries = Object.entries(totalPerCountry[selectedCancer])
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([country]) => country);

    // Build traces: bars stay the same, hovertemplate changes for small screens
    const topTraces = topCountries.map((country, i) => ({
      x: years,
      y: years.map(year => dataMap[selectedCancer][country][year] || 0),
      type: "bar",
      name: country,
      marker: { color: colors[i % colors.length] },
      hovertemplate:
        i < (windowWidth <= 1080 ? 3 : 5)
          ? `<b>Cancer:</b> ${selectedCancer}<br><b>Country:</b> ${country}<br><b>Year:</b> %{x}<br><b>Articles:</b> %{y}<extra></extra>`
          : undefined,
      hoverinfo: i < (windowWidth <= 1080 ? 3 : 5) ? undefined : "skip",
      offsetgroup: "top5",
    }));

    const totalAllCountriesY = years.map(year =>
      Object.keys(dataMap[selectedCancer]).reduce(
        (sum, country) => sum + (dataMap[selectedCancer][country][year] || 0),
        0
      )
    );

    const allCountriesTrace = {
      x: years,
      y: totalAllCountriesY,
      type: "bar",
      name: "All countries",
      marker: { color: "#4682B4", opacity: 1 },
      hovertemplate:
        windowWidth > 1080
          ? `<b>Cancer:</b> ${selectedCancer}<br><b>Country:</b> All countries<br><b>Year:</b> %{x}<br><b>Articles:</b> %{y}<extra></extra>`
          : undefined,
      hoverinfo: windowWidth > 1080 ? undefined : "skip",
      offsetgroup: "top5",
      base: 0,
    };

    const annotations = totalAllCountriesY.map((y, i) => ({
      x: years[i],
      y,
      text: y.toString(),
      xref: "x",
      yref: "y",
      xanchor: "center",
      yanchor: "bottom",
      showarrow: false,
      font: { color: "black", size: windowWidth <= 1080 ? 9 : 12 },
      textangle: -90,
    }));

    return { plotData: [allCountriesTrace, ...topTraces], annotations };
  }, [selectedCancer, dataMap, totalPerCountry, years, windowWidth]);

  const maxBarValue = Math.max(...plotData.flatMap(t => t.y), 0);
  const rawStep = maxBarValue / 10;
  const magnitude = Math.pow(10, Math.floor(Math.log10(rawStep)));
  let step = Math.ceil(rawStep / magnitude) * magnitude;
  step = Math.max(1, step);
  const upper = Math.ceil(maxBarValue / step) * step;
  const tickvals = Array.from({ length: Math.floor(upper / step) + 1 }, (_, i) => i * step);

  const formatCompact = (num) => {
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
    if (num >= 1_000) return (num / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
    return num.toString();
  };

  const plotTitle = windowWidth <= 1080
    ? <>Countries with the highest <br />number of <b>{selectedCancer}</b> studies</>
    : <>Countries with the highest number of <b>{selectedCancer}</b> studies</>;

  const titleStyle = {
    textAlign: "center",
    marginBottom: "0rem",
    fontWeight: "normal",
    fontSize: windowWidth <= 1080 ? "16px" : "20px",
    color: "black",
  };

  const config = {
    responsive: true,
    displaylogo: false,
    modeBarButtonsToRemove: [
      "zoom2d","pan2d","select2d","lasso2d","zoomIn2d","zoomOut2d",
      "autoScale2d","hoverClosestCartesian","hoverCompareCartesian"
    ],
    modeBarButtons: [["resetScale2d"]],
  };

  return (
    <div className="plotly-responsive-plot-container" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <h2 style={titleStyle}>{plotTitle}</h2>

      <Plot
        key={selectedCancer}
        data={plotData}
        layout={{
          xaxis: {
            title: { text: "Year", font: { color: "black", size: windowWidth <= 1080 ? 12 : 16 } },
            tickmode: "array",
            tickvals: years,
            ticktext: years,
            tickangle: -90,
            showgrid: false,
            zeroline: false,
            linecolor: "black",
            tickfont: { color: "black", size: windowWidth <= 1080 ? 9 : 14 },
          },
          yaxis: {
            title: { text: "Number of articles", font: { color: "black", size: windowWidth <= 1080 ? 12 : 16 }, standoff: 15 },
            automargin: true,
            showgrid: true,
            zeroline: false,
            gridcolor: "rgba(0,0,0,0.075)",
            tickfont: { color: "black", size: windowWidth <= 1080 ? 9 : 14 },
            range: [0, maxBarValue * 1.2],
            tickmode: "array",
            tickvals: tickvals,
            ticktext: tickvals.map(formatCompact),
          },
          margin: { t: 20, b: 80, l: 50, r: windowWidth <= 1080 ? 20 : 50 },
          paper_bgcolor: "#f6f8fa",
          plot_bgcolor: "#f6f8fa",
          autosize: true,
          barmode: "stack",
          hovermode: "x",
          annotations: annotations,
          legend: { x: 0.5, y: -0.2, xanchor: "center", orientation: "h", font: { color: "black", size: windowWidth <= 1080 ? 9 : 12 } },
        }}
        config={config}
        useResizeHandler={true}
        style={{ width: "100%", height: windowWidth <= 1080 ? 400 : 620 }}
      />

      <div style={{ display: "flex", gap: "20px", marginTop: "20px", color: "black" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <label htmlFor="cancer-select-bar">Cancer:</label>
          <select
            id="cancer-select-bar"
            onChange={handleCancerChange}
            value={selectedCancer}
            style={{ padding: "5px", borderRadius: "5px", border: "1px solid black", backgroundColor: "white", color: "black" }}
          >
            {uniqueCancers.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>
    </div>
  );
};

export default HistogramSelectCancerShowTopCountries;
