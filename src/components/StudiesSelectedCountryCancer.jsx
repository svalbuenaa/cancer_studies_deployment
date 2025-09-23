import React, { useEffect, useState } from "react";
import Plot from "react-plotly.js";

const StudiesSelectedCountryCancer = ({ csvPath }) => {
  const [data, setData] = useState([]);
  const [uniqueCountries, setUniqueCountries] = useState([]);
  const [uniqueCancers, setUniqueCancers] = useState([]);

  const [selectedCountry, setSelectedCountry] = useState("United States");
  const [selectedCancer, setSelectedCancer] = useState("Breast cancer");

  // 🔹 Track screen width for responsive title and layout
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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

          const sortedData = parsedData.sort((a, b) => a.Year - b.Year);
          setData(sortedData);

          const countries = [...new Set(sortedData.map((d) => d.Country))].sort();
          const cancers = [...new Set(sortedData.map((d) => d.Cancer))].sort();

          setUniqueCountries(countries);
          setUniqueCancers(cancers);
        }
      } catch (error) {
        console.error("Error fetching or parsing CSV:", error);
      }
    };

    fetchData();
  }, [csvPath]);

  const handleCountryChange = (event) => {
    setSelectedCountry(event.target.value);
  };

  const handleCancerChange = (event) => {
    setSelectedCancer(event.target.value);
  };

  const years = [...new Set(data.map((d) => d.Year))].sort();

  const totalArticlesByYear = years.map((year) =>
    data
      .filter((d) => d.Year === year)
      .filter((d) => d.Cancer === selectedCancer)
      .reduce((sum, d) => sum + parseInt(d.Articles), 0)
  );

  const totalArticlesTrace = {
    x: years,
    y: totalArticlesByYear,
    type: "bar",
    name: `Total ${selectedCancer} studies`,
    marker: { color: "#4682B4", opacity: 1 },
    hovertemplate: `<b>Year:</b> %{x}<br><b>Total ${selectedCancer} studies:</b> %{y}<extra></extra>`,
  };

  const plotData = [totalArticlesTrace];

  let filteredData = data
    .filter((d) => d.Country === selectedCountry)
    .filter((d) => d.Cancer === selectedCancer);

  const filteredArticlesByYear = years.map((year) =>
    filteredData
      .filter((d) => d.Year === year)
      .reduce((sum, d) => sum + parseInt(d.Articles), 0)
  );

  const filteredArticlesTrace = {
    x: years,
    y: filteredArticlesByYear,
    type: "bar",
    name: `${selectedCountry} ${selectedCancer} studies`,
    marker: { color: "#FFA500" },
    hovertemplate: `<b>Year:</b> %{x}<br><b>${selectedCountry} ${selectedCancer} studies:</b> %{y}<extra></extra>`,
  };

  plotData.push(filteredArticlesTrace);

  // 🔹 Responsive plot title
  const plotTitle =
    windowWidth <= 768
      ? `Studies per year<br> in <b>${selectedCountry}</b> for <b>${selectedCancer}</b>`
      : `Studies per year in <b>${selectedCountry}</b> for <b>${selectedCancer}</b>`;

  const annotations = plotData
    .flatMap((trace, traceIndex) =>
      trace.y
        .map((y, index) => {
          if (y === 0) return null;
          const isTotalTrace = traceIndex === 0;
          return {
            x: years[index],
            y: isTotalTrace ? y : 0,
            text: y.toString(),
            xref: "x",
            yref: "y",
            xanchor: "center",
            yanchor: isTotalTrace ? "bottom" : "top",
            yshift: isTotalTrace ? 10 : -2,
            showarrow: false,
            font: { color: "black", size: 12 },
            textangle: -90,
          };
        })
        .filter((a) => a !== null)
    );

  // Dynamic y-axis ticks
  const maxVal = Math.max(...totalArticlesByYear);
  const rawStep = maxVal / 10;
  const magnitude = Math.pow(10, Math.floor(Math.log10(rawStep)));
  const step = Math.ceil(rawStep / magnitude) * magnitude;
  const upper = Math.ceil(maxVal / step) * step;

  const tickvals = Array.from(
    { length: Math.floor(upper / step) + 1 },
    (_, i) => i * step
  );

  const formatCompact = (num) => {
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
    if (num >= 1_000) return (num / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
    return num.toString();
  };

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
  };

  return (
    <div
      className="plotly-responsive-plot-container"
      style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
    >
      <Plot
        data={plotData}
        layout={{
          title: {
            text: plotTitle,
            x: 0.5,
            xanchor: "center",
            font: { size: windowWidth <= 768 ? 14 : 18, color: "black" },
            y: 0.95,
          },
          xaxis: {
            title: { text: "Year", font: { color: "black", size: 16 } },
            tickmode: "array",
            tickvals: years,
            ticktext: years,
            tickangle: -90,
            showgrid: false,
            zeroline: false,
            linecolor: "black",
            gridcolor: "rgba(255, 255, 255, 0.2)",
            tickfont: { color: "black" },
          },
          yaxis: {
            title: {
              text: "Number of studies",
              font: { color: "black", size: 16 },
              standoff: 20,
            },
            showgrid: true,
            zeroline: false,
            showline: false,
            linecolor: "black",
            gridcolor: "rgba(0, 0, 0, 0.075)",
            tickfont: { color: "black" },
            range: [-maxVal * 0.24, upper * 1.25],
            tickmode: "array",
            tickvals: tickvals,
            ticktext: tickvals.map((v) => formatCompact(v)),
          },
          margin: { t: 60, b: 150, l: 60, r: 60 },
          paper_bgcolor: "#f6f8fa",
          plot_bgcolor: "#f6f8fa",
          autosize: true,
          annotations: annotations,
          barmode: "overlay",
          hovermode: "x",
          legend: {
            x: 0.5,
            y: -0.2,
            xanchor: "center",
            orientation: "h",
            font: { color: "black" },
          },
        }}
        config={config}
        useResizeHandler={true}
        className="plotly-responsive-plot"
      />
      <div
        style={{
          display: "flex",
          gap: "20px",
          marginTop: "20px",
          color: "black",
          // 💡 Conditional styling based on screen size
          flexDirection: windowWidth <= 768 ? "column" : "row",
          alignItems: windowWidth <= 768 ? "center" : "flex-start",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <label htmlFor="country-select">Country:</label>
          <select
            id="country-select"
            onChange={handleCountryChange}
            style={{
              padding: "5px",
              borderRadius: "5px",
              border: "1px solid black",
              backgroundColor: "white",
              color: "black",
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
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <label htmlFor="cancer-select">Cancer:</label>
          <select
            id="cancer-select"
            onChange={handleCancerChange}
            style={{
              padding: "5px",
              borderRadius: "5px",
              border: "1px solid black",
              backgroundColor: "white",
              color: "black",
            }}
            value={selectedCancer}
          >
            {uniqueCancers.map((cancer) => (
              <option key={cancer} value={cancer}>
                {cancer}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default StudiesSelectedCountryCancer;