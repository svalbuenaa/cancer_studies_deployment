import React, { useEffect, useState, useMemo } from "react";
import Plot from "react-plotly.js";

const SelectCancerShowCountriesLines = ({ csvPath, selectedCancer }) => {
  const [data, setData] = useState([]);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [dataMap, setDataMap] = useState({});
  const [years, setYears] = useState([]);
  const [topCountries, setTopCountries] = useState([]);

  // Debounced window resize
  useEffect(() => {
    const handleResize = () => {
      clearTimeout(window.resizeTimeout);
      window.resizeTimeout = setTimeout(() => setWindowWidth(window.innerWidth), 150);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Load CSV
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
        }
      } catch (error) {
        console.error("Error fetching CSV:", error);
      }
    };
    fetchData();
  }, [csvPath]);

  // Precompute dataMap & years
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

  // Compute top 5 countries
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
      .slice(0,5)
      .map(d => d.country);
    setTopCountries(top5);
  }, [selectedCancer, dataMap]);

  const colors = ["#FF5733", "#19ad17", "#33e7ff", "#FF33A1", "#FFC300"];

  // Build plotData
  const plotData = useMemo(() => {
    if (!selectedCancer || !dataMap[selectedCancer]) return [];
    return topCountries.map((country, idx) => ({
      x: years,
      y: years.map(y => dataMap[selectedCancer][country][y] || 0),
      type: "scatter",
      mode: "lines+markers",
      name: country,
      line: { color: colors[idx % colors.length], width: 3 },
      marker: { size: 6 },
      hovertemplate:
        `<b>Cancer:</b> ${selectedCancer}<br>` +
        `<b>Country:</b> ${country}<br>` +
        `<b>Year:</b> %{x}<br>` +
        `<b>Articles:</b> %{y}<extra></extra>`,
    }));
  }, [selectedCancer, dataMap, topCountries, years]);

  const maxVal = Math.max(...plotData.flatMap(t => t.y), 0);

  // Title above plot
  const plotTitle = windowWidth <= 768
    ? <>Countries with the highest number of<br/><b>{selectedCancer}</b>studies, tendencies</>
    : <>Countries with the highest number of <b>{selectedCancer}</b> studies, tendencies</>;

  const titleStyle = {
    textAlign: "center",
    marginBottom: windowWidth <= 768 ? "0rem" : "0rem",
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
      "autoScale2d","hoverClosestCartesian","hoverCompareCartesian",
	  "toImage",
    ],
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
      <h2 style={titleStyle}>{plotTitle}</h2>
      <Plot
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
    </div>
  );
};

export default SelectCancerShowCountriesLines;
