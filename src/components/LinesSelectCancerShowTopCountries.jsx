import React, { useEffect, useState, useMemo } from "react";
import Plot from "react-plotly.js";

const LinesSelectCancerShowTopCountries = ({ csvPath }) => {
  const [data, setData] = useState([]);
  const [uniqueCancers, setUniqueCancers] = useState([]);
  const [selectedCancer, setSelectedCancer] = useState("Breast cancer"); 
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [dataMap, setDataMap] = useState({});
  const [years, setYears] = useState([]);
  const [topCountries, setTopCountries] = useState([]);

  const colors = ["#e6194b", "#3cb44b", "#ffe119", "#4363d8", "#f58231"];

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
    const yearSet = new Set();

    data.forEach(d => {
      const { Cancer: ca, Country: c, Year: y, Articles } = d;
      const val = parseInt(Articles);
      yearSet.add(y);
      if (!map[ca]) map[ca] = {};
      if (!map[ca][c]) map[ca][c] = {};
      map[ca][c][y] = val;
    });

    setDataMap(map);
    setYears([...yearSet].sort());
  }, [data]);

  useEffect(() => {
    if (!selectedCancer || !dataMap[selectedCancer]) {
      setTopCountries([]);
      return;
    }

    const top5 = Object.entries(dataMap[selectedCancer])
      .map(([country, yearMap]) => ({
        country,
        total: Object.values(yearMap).reduce((a,b) => a+b, 0)
      }))
      .sort((a,b) => b.total - a.total)
      .slice(0,5);

    setTopCountries(top5.map(d => d.country));
  }, [selectedCancer, dataMap]);

  const handleCancerChange = (event) => setSelectedCancer(event.target.value);

  const plotData = useMemo(() => {
    if (!selectedCancer || !dataMap[selectedCancer]) return [];

    const legendCountries = [...topCountries].reverse();

    return legendCountries.map((country, idx) => {
      const colorIdx = topCountries.indexOf(country);
      const showHover = colorIdx < (windowWidth <= 1080 ? 3 : 5);

      return {
        x: years,
        y: years.map(y => dataMap[selectedCancer][country][y] || 0),
        type: "scatter",
        mode: "lines+markers",
        name: country,
        line: { color: colors[colorIdx % colors.length], width: 3 },
        marker: { size: 6 },
        hovertemplate: showHover
          ? `<b>Cancer:</b> ${selectedCancer}<br><b>Country:</b> ${country}<br><b>Year:</b> %{x}<br><b>Articles:</b> %{y}<extra></extra>`
          : undefined,
        hoverinfo: showHover ? undefined : "skip",
      };
    });
  }, [selectedCancer, dataMap, topCountries, years, windowWidth]);

  const maxVal = Math.max(...plotData.flatMap(t => t.y), 0);
  const yearNumbers = years.map(y => parseInt(y, 10));
  const xRange = [yearNumbers[0] - 0.5, yearNumbers[yearNumbers.length - 1] + 0.5];

  const plotTitle = windowWidth <= 768
    ? <>Countries with the highest number of<br/><b>{selectedCancer}</b> studies, tendencies</>
    : <>Countries with the highest number of <b>{selectedCancer}</b> studies, tendencies</>;

  const titleStyle = {
    textAlign: "center",
    marginBottom: "0.5rem",
    fontWeight: "normal",
    fontSize: windowWidth <= 768 ? "16px" : "20px",
    color: "black",
    lineHeight: 1.2
  };

  const config = {
    responsive: true,
    displaylogo: false,
    modeBarButtonsToRemove: [
      "zoom2d","pan2d","select2d","lasso2d","zoomIn2d","zoomOut2d",
      "autoScale2d","hoverClosestCartesian","hoverCompareCartesian","toImage",
    ],
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
      <h2 style={titleStyle}>{plotTitle}</h2>

      <Plot
        key={selectedCancer}
        data={plotData}
        layout={{
          autosize: true,
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
            range: xRange,
          },
          yaxis: {
            title: { text: "Number of articles", font: { color: "black", size: windowWidth <= 1080 ? 12 : 16 }, standoff: 15 },
            showgrid: true,
            zeroline: false,
            showline: false,
            gridcolor: "rgba(0,0,0,0.075)",
            tickfont: { color: "black", size: windowWidth <= 1080 ? 9 : 14 },
            range: [0, maxVal * 1.2],
            tickformat: "~s",
          },
          paper_bgcolor: "#f6f8fa",
          plot_bgcolor: "#f6f8fa",
          hovermode: "x",
          margin: { t: 20, b: 80, l: 50, r: windowWidth <= 768 ? 20 : 50 },
          legend: { x: 0.5, y: -0.2, xanchor: "center", orientation: "h", font: { color: "black", size: windowWidth <= 1080 ? 9 : 12 } },
        }}
        config={config}
        useResizeHandler={true}
        style={{ width: "100%", minWidth: "300px", maxWidth: "100%", height: windowWidth <= 1080 ? 400 : 620 }}
      />

      <div style={{ display: "flex", gap: "20px", marginTop: "20px", color: "black" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <label htmlFor="cancer-select-line">Cancer:</label>
          <select
            id="cancer-select-line"
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

export default LinesSelectCancerShowTopCountries;
