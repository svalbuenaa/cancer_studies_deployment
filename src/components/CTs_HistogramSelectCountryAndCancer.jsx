import React, { useEffect, useState, useMemo, useCallback } from "react";
import Plot from "react-plotly.js";

const CTs_HistogramSelectCountryAndCancer = ({ csvPath }) => {
  const [data, setData] = useState([]);
  const [uniqueCountries, setUniqueCountries] = useState([]);
  const [uniqueCancers, setUniqueCancers] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState("United States");
  const [selectedCancer, setSelectedCancer] = useState("Breast cancer");
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [revision, setRevision] = useState(0);

  // State to manage the Plotly layout for dynamic updates
  const [layout, setLayout] = useState({});

  // Track window size for responsive behavior
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
                return header.reduce((obj, key, index) => {
                  obj[key] = values[index].trim();
                  return obj;
                }, {});
              }
              return null;
            })
            .filter((d) => d && d.Year && d.Articles && d.Country && d.Cancer);

          setData(parsedData);
          const countries = [...new Set(parsedData.map((d) => d.Country))].sort();
          const cancers = [...new Set(parsedData.map((d) => d.Cancer))].sort();
          setUniqueCountries(countries);
          setUniqueCancers(cancers);
          if (countries.includes("United States")) setSelectedCountry("United States");
          if (cancers.includes("Breast cancer")) setSelectedCancer("Breast cancer");
        }
      } catch (error) {
        console.error("Error fetching CSV:", error);
      }
    };
    fetchData();
  }, [csvPath]);

  // Increment revision when selections change
  useEffect(() => {
    setRevision((r) => r + 1);
  }, [selectedCountry, selectedCancer]);

  // Data calculations
  const years = useMemo(() => [...new Set(data.map((d) => d.Year))].sort(), [data]);

  const totalArticlesByYear = useMemo(
    () =>
      years.map((year) =>
        data
          .filter((d) => d.Year === year && d.Cancer === selectedCancer)
          .reduce((sum, d) => sum + parseInt(d.Articles), 0)
      ),
    [years, data, selectedCancer]
  );

  const filteredArticlesByYear = useMemo(() => {
    const filteredData = data.filter(
      (d) => d.Country === selectedCountry && d.Cancer === selectedCancer
    );
    return years.map((year) =>
      filteredData
        .filter((d) => d.Year === year)
        .reduce((sum, d) => sum + parseInt(d.Articles), 0)
    );
  }, [years, data, selectedCountry, selectedCancer]);

  const plotData = useMemo(
    () => [
      {
        x: years,
        y: totalArticlesByYear,
        type: "bar",
        name: `Total ${selectedCancer} studies`,
        marker: { color: "#4682B4" },
        hovertemplate: `<b>Year:</b> %{x}<br><b>Total ${selectedCancer} studies:</b> %{y}<extra></extra>`,
        offsetgroup: "total",
      },
      {
        x: years,
        y: filteredArticlesByYear,
        type: "bar",
        name: `${selectedCountry} ${selectedCancer} studies`,
        marker: { color: "#FFA500" },
        hovertemplate: `<b>Year:</b> %{x}<br><b>${selectedCountry} ${selectedCancer} studies:</b> %{y}<extra></extra>`,
        offsetgroup: "total",
      },
    ],
    [years, totalArticlesByYear, filteredArticlesByYear, selectedCountry, selectedCancer]
  );

  // Dynamic y-axis ticks
  const { tickvals, upper, maxVal } = useMemo(() => {
    const maxVal = Math.max(...plotData.flatMap((t) => t.y), 0);
    const rawStep = maxVal / 10 || 1;
    const magnitude = Math.pow(10, Math.floor(Math.log10(rawStep)));
    let step = Math.ceil(rawStep / magnitude) * magnitude;
    step = Math.max(1, step);
    const upper = Math.ceil(maxVal / step) * step;
    const tickvals = Array.from({ length: Math.floor(upper / step) + 1 }, (_, i) => i * step);
    return { tickvals, upper, maxVal };
  }, [plotData]);

  // Stable formatCompact function
  const formatCompact = useCallback((num) => {
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
    if (num >= 1_000) return (num / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
    return num.toString();
  }, []);

  // Annotations
  const annotations = useMemo(
    () =>
      years.flatMap((year, i) => {
        const totalY = totalArticlesByYear[i];
        const filteredY = filteredArticlesByYear[i];
        return [
          totalY > 0 && {
            x: year,
            y: totalY,
            text: totalY.toString(),
            xref: "x",
            yref: "y",
            xanchor: "center",
            yanchor: "bottom",
            showarrow: false,
            font: { color: "black", size: windowWidth <= 1080 ? 9 : 12 },
            textangle: -90,
          },
          filteredY > 0 && {
            x: year,
            y: 0,
            text: filteredY.toString(),
            xref: "x",
            yref: "y",
            xanchor: "center",
            yanchor: "top",
            showarrow: false,
            font: { color: "black", size: windowWidth <= 1080 ? 9 : 12 },
            textangle: -90,
          },
        ].filter(Boolean);
      }),
    [years, totalArticlesByYear, filteredArticlesByYear, windowWidth]
  );

  // Calculate the stable target yaxis range
  const targetYRange = useMemo(
    () => [-upper * (windowWidth <= 1080 ? 0.15 : 0.15), upper * 1.25],
    [upper, windowWidth]
  );

  // Plotly onRelayout handler to force correct axis reset on double-click
  const handleRelayout = useCallback((event) => {
      // Check if the event is a double-click reset action
      if (event['yaxis.autorange'] === true) {
          setLayout(prevLayout => ({
              ...prevLayout,
              // Use targetYRange to reset to the desired full view, fixing the double-click issue
              yaxis: { ...prevLayout.yaxis, range: targetYRange, autorange: false },
              // uirevision update forces the plot to respect the new layout state
              uirevision: (prevLayout.uirevision || 0) + 1,
          }));
      }
  }, [targetYRange]);

  // Base layout configuration (Dependencies are stable)
  const baseLayout = useMemo(() => ({
    // Use uirevision to reset the view state when selections change.
    uirevision: selectedCountry + selectedCancer,
    xaxis: {
      title: { text: "Year", font: { color: "black", size: windowWidth <= 1080 ? 12 : 16 } },
      tickmode: "array",
      tickvals: years,
      ticktext: years,
      tickangle: -90,
      showgrid: false,
      zeroline: true,
      zerolinecolor: 'black',
      linecolor: "black",
      gridcolor: "rgba(255, 255, 255, 0.2)",
      tickfont: { color: "black", size: windowWidth <= 1080 ? 9 : 14 },
    },
    yaxis: {
      title: {
        text: "Number of studies",
        font: { color: "black", size: windowWidth <= 1080 ? 12 : 16 },
        standoff: 15,
      },
      automargin: true,
      showgrid: true,
      zeroline: false,
      showline: false,
      linecolor: "black",
      gridcolor: "rgba(0,0,0,0.075)",
      tickfont: { color: "black", size: windowWidth <= 1080 ? 9 : 14 },
      // Set the initial range, which includes the negative space for annotations
      range: targetYRange,
      tickmode: "array",
      tickvals: tickvals,
      ticktext: tickvals.map(formatCompact),
      autorange: false, // Prevents Plotly from interfering with the initial range
    },
    margin: { t: 20, b: windowWidth <= 1080 ? 80 : 80, l: 50, r: windowWidth <= 1080 ? 20 : 50 },
    paper_bgcolor: "#f6f8fa",
    plot_bgcolor: "#f6f8fa",
    autosize: true,
    barmode: "overlay",
    dragmode: false,
    hovermode: "x",
    annotations: annotations,
    legend: {
      x: 0.5,
      y: -0.2,
      xanchor: "center",
      orientation: "h",
      font: { color: "black", size: windowWidth <= 1080 ? 9 : 12 },
    },
  }), [selectedCountry, selectedCancer, windowWidth, years, tickvals, annotations, targetYRange, formatCompact]);

  // Initialize or update the local layout state
  useEffect(() => {
    setLayout(baseLayout);
  }, [baseLayout]);


  const config = {
    responsive: true,
    displaylogo: false,
    modeBarButtonsToRemove: [
      "zoom2d",
      "pan2d",
      "select2d",
      "lasso2d",
      "zoomIn2d",
      "zoomOut2d",
      "autoScale2d",
      "hoverClosestCartesian",
      "hoverCompareCartesian",
      "toImage",
    ],
    displayModeBar: false,
  };

  const plotTitle =
    windowWidth <= 1080 ? (
      <>
        Studies per year<br />in <b>{selectedCountry}</b> for <b>{selectedCancer}</b>
      </>
    ) : (
      <>Studies per year in <b>{selectedCountry}</b> for <b>{selectedCancer}</b></>
    );

  const titleStyle = {
    textAlign: "center",
    marginBottom: "0rem",
    fontWeight: "normal",
    fontSize: windowWidth <= 1080 ? "16px" : "20px",
    color: "black",
  };

  // Plot height should be generous to accommodate the 50% negative space
  const plotHeight = windowWidth <= 1080 ? 450 : 680;

  return (
    <div
      className="plotly-responsive-plot-container"
      style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
    >
      {/* Title above the plot */}
      <h2 style={titleStyle}>{plotTitle}</h2>

      <Plot
        data={plotData}
        layout={layout}
        config={config}
        revision={revision}
        onRelayout={handleRelayout}
        useResizeHandler={true}
        className="plotly-responsive-plot"
        style={{ width: "100%", height: plotHeight }}
      />

      {/* Dropdowns */}
      <div
        style={{
          display: "flex",
          gap: "20px",
          marginTop: "20px",
          color: "black",
          flexDirection: windowWidth <= 1080 ? "column" : "row",
          alignItems: windowWidth <= 1080 ? "center" : "flex-start",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <label htmlFor="country-select">Country:</label>
          <select
            id="country-select"
            onChange={(e) => setSelectedCountry(e.target.value)}
            value={selectedCountry}
            style={{
              padding: "5px",
              borderRadius: "5px",
              border: "1px solid black",
              backgroundColor: "white",
              color: "black",
            }}
          >
            {uniqueCountries.map((country) => (
              <option key={country} value={country}>
                {country}
              </option>
            ))}
          </select>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <label htmlFor="cancer-select">Cancer:</label>
          <select
            id="cancer-select"
            onChange={(e) => setSelectedCancer(e.target.value)}
            value={selectedCancer}
            style={{
              padding: "5px",
              borderRadius: "5px",
              border: "1px solid black",
              backgroundColor: "white",
              color: "black",
            }}
          >
            {uniqueCancers.map((cancer) => (
              <option key={cancer} value={cancer}>
                {cancer}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 💥 FIX: Removed 'jsx' attribute to resolve warning */}
      <style>{` 
        .modebar {
          top: auto !important;
          bottom: 5px !important;
          right: 10px !important;
        }
      `}</style>
    </div>
  );
};

export default CTs_HistogramSelectCountryAndCancer;