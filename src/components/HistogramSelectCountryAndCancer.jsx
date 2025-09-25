import React, { useEffect, useState } from "react";
import Plot from "react-plotly.js";

const HistogramSelectCountryAndCancer = ({ csvPath }) => {
  const [data, setData] = useState([]);
  const [uniqueCountries, setUniqueCountries] = useState([]);
  const [uniqueCancers, setUniqueCancers] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState("United States");
  const [selectedCancer, setSelectedCancer] = useState("Breast cancer");
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

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

  const handleCountryChange = (e) => setSelectedCountry(e.target.value);
  const handleCancerChange = (e) => setSelectedCancer(e.target.value);

  const years = [...new Set(data.map((d) => d.Year))].sort();

  const totalArticlesByYear = years.map((year) =>
    data
      .filter((d) => d.Year === year && d.Cancer === selectedCancer)
      .reduce((sum, d) => sum + parseInt(d.Articles), 0)
  );

  const filteredData = data.filter(
    (d) => d.Country === selectedCountry && d.Cancer === selectedCancer
  );

  const filteredArticlesByYear = years.map((year) =>
    filteredData
      .filter((d) => d.Year === year)
      .reduce((sum, d) => sum + parseInt(d.Articles), 0)
  );

  const plotData = [
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
  ];

  // Dynamic y-axis ticks with min step = 1
  const maxVal = Math.max(...plotData.flatMap((t) => t.y));
  const rawStep = maxVal / 10;
  const magnitude = Math.pow(10, Math.floor(Math.log10(rawStep)));
  let step = Math.ceil(rawStep / magnitude) * magnitude;
  step = Math.max(1, step);
  const upper = Math.ceil(maxVal / step) * step;
  const tickvals = Array.from({ length: Math.floor(upper / step) + 1 }, (_, i) => i * step);

  const formatCompact = (num) => {
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
    if (num >= 1_000) return (num / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
    return num.toString();
  };

  // ✅ Annotations: top for total, bottom for selected country
  const annotations = years.flatMap((year, i) => {
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
        y: 0, // place at baseline
        text: filteredY.toString(),
        xref: "x",
        yref: "y",
        xanchor: "center",
        yanchor: "top",
        yshift: -5,
        showarrow: false,
        font: { color: "black", size: windowWidth <= 1080 ? 9 : 12 },
        textangle: -90,
      },
    ].filter(Boolean);
  });

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
    ],
    modeBarButtons: [["resetScale2d"]],
  };

  const plotTitle = windowWidth <= 1080
    ? <>Studies per year<br />in <b>{selectedCountry}</b> for <b>{selectedCancer}</b></>
    : <>Studies per year in <b>{selectedCountry}</b> for <b>{selectedCancer}</b></>;

  const titleStyle = {
    textAlign: "center",
    marginBottom: "0rem",
    fontWeight: "normal",
    fontSize: windowWidth <= 1080 ? "16px" : "20px",
    color: "black",
  };

  return (
    <div
      className="plotly-responsive-plot-container"
      style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
    >
      {/* Title above the plot */}
      <h2 style={titleStyle}>{plotTitle}</h2>

      <Plot
        key={`${selectedCountry}-${selectedCancer}`}
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
            range: [-maxVal * 0.24, upper * 1.25], // ✅ restored old logic
            tickmode: "array",
            tickvals: tickvals,
            ticktext: tickvals.map(formatCompact),
          },
          margin: { t: 20, b: windowWidth <= 1080 ? 80 : 80, l: 50, r: windowWidth <= 1080 ? 20 : 50 },
          paper_bgcolor: "#f6f8fa",
          plot_bgcolor: "#f6f8fa",
          autosize: true,
          barmode: "overlay",
          hovermode: "x",
          annotations: annotations,
          legend: {
            x: 0.5,
            y: -0.2,
            xanchor: "center",
            orientation: "h",
            font: { color: "black", size: windowWidth <= 1080 ? 9 : 12 },
          },
        }}
        config={config}
        useResizeHandler={true}
        className="plotly-responsive-plot"
        style={{ width: "100%", height: windowWidth <= 1080 ? 400 : 620 }}
      />

      {/* Country and Cancer select dropdowns */}
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
            onChange={handleCountryChange}
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
            onChange={handleCancerChange}
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

      <style jsx>{`
        .modebar {
          top: auto !important;
          bottom: 5px !important;
          right: 10px !important;
        }
      `}</style>
    </div>
  );
};

export default HistogramSelectCountryAndCancer;
