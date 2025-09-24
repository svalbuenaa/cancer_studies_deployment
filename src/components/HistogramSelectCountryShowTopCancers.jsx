import React, { useEffect, useState } from "react";
import Plot from "react-plotly.js";

const HistogramSelectCountryShowTopCancers = ({ csvPath }) => {
  const [data, setData] = useState([]);
  const [uniqueCountries, setUniqueCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState("Switzerland");
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

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
            .filter(
              (d) =>
                d &&
                d.Year &&
                d.Articles &&
                d.Country &&
                d.Cancer &&
                d.Cancer !== "Undetermined cancer" &&
                d.Cancer !== "Other cancer"
            );

          setData(parsedData);
          const countries = [...new Set(parsedData.map((d) => d.Country))].sort();
          setUniqueCountries(countries);
          if (countries.includes("Switzerland")) {
            setSelectedCountry("Switzerland");
          } else if (countries.length > 0) {
            setSelectedCountry(countries[0]);
          }
        }
      } catch (error) {
        console.error("Error fetching CSV:", error);
      }
    };
    fetchData();
  }, [csvPath]);

  // Track window width for responsive title
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleCountryChange = (event) => setSelectedCountry(event.target.value);

  const years = [...new Set(data.map((d) => d.Year))].sort();

  const topCancers = [...new Set(data.map((d) => d.Cancer))]
    .map((cancer) => {
      const total = data
        .filter((d) => d.Cancer === cancer && d.Country === selectedCountry)
        .reduce((sum, d) => sum + parseInt(d.Articles), 0);
      return { cancer, total };
    })
    .sort((a, b) => b.total - a.total)
    .slice(0, 5)
    .map((d) => d.cancer);

  const top5Traces = topCancers.map((cancer, index) => {
    const yValues = years.map((year) => {
      const entry = data.find(
        (d) =>
          d.Country === selectedCountry &&
          d.Cancer === cancer &&
          d.Year === year
      );
      return entry ? parseInt(entry.Articles) : 0;
    });

    const colors = ["#FF5733", "#19ad17", "#33e7ff", "#FF33A1", "#FFC300"];
    return {
      x: years,
      y: yValues,
      type: "bar",
      name: cancer,
      marker: { color: colors[index % colors.length] },
      hovertemplate:
        `<b>Country:</b> ${selectedCountry}<br>` +
        `<b>Cancer:</b> ${cancer}<br>` +
        `<b>Year:</b> %{x}<br>` +
        `<b>Articles:</b> %{y}<extra></extra>`,
      offsetgroup: "top5",
    };
  });

  const totalAllCancersY = years.map((year) =>
    data
      .filter((d) => d.Country === selectedCountry && d.Year === year)
      .reduce((sum, d) => sum + parseInt(d.Articles), 0)
  );

  const allCancersTrace = {
    x: years,
    y: totalAllCancersY,
    type: "bar",
    name: "All cancers",
    marker: { color: "#4682B4", opacity: 1 },
    hovertemplate:
      `<b>Country:</b> ${selectedCountry}<br>` +
      `<b>Cancer:</b> All cancers<br>` +
      `<b>Year:</b> %{x}<br>` +
      `<b>Articles:</b> %{y}<extra></extra>`,
    offsetgroup: "top5",
    base: 0,
  };

  const allCancersAnnotations = totalAllCancersY.map((y, i) => ({
    x: years[i],
    y: y,
    text: y.toString(),
    xref: "x",
    yref: "y",
    xanchor: "center",
    yanchor: "bottom",
    showarrow: false,
    font: { color: "black", size: 12 },
    textangle: -90,
  }));

  const plotData = [allCancersTrace, ...top5Traces];

  // Responsive title
  const plotTitle =
    windowWidth <= 1080
      ? `Most studied cancers<br>in <b>${selectedCountry}</b>`
      : `Most studied cancers in <b>${selectedCountry}</b>`;

  const maxBarValue = Math.max(...plotData.flatMap((t) => t.y));
  const rawStep = maxBarValue / 10;
  const magnitude = Math.pow(10, Math.floor(Math.log10(rawStep)));
  const step = Math.ceil(rawStep / magnitude) * magnitude;
  const upper = Math.ceil(maxBarValue / step) * step;
  const tickvals = Array.from(
    { length: Math.floor(upper / step) + 1 },
    (_, i) => i * step
  );

  const formatCompact = (num) => {
    if (num >= 1_000_000)
      return (num / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
    if (num >= 1_000)
      return (num / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
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
            font: { size: windowWidth <= 1080 ? 16 : 18, color: "black" },
            y: 0.95,
          },
          xaxis: {
            title: { text: "Year", font: { color: "black", size: 14 } },
            tickmode: "array",
            tickvals: years,
            ticktext: years,
            tickangle: -90,
            showgrid: false,
            zeroline: false,
            linecolor: "black",
            gridcolor: "rgba(255, 255, 255, 0.2)",
            tickfont: { color: "black", size: windowWidth <= 1080 ? 9 : 12 },
          },
          yaxis: {
            title: {
              text: "Number of articles",
              font: { color: "black", size: 14 },
              standoff: 15,
            },
            showgrid: true,
            zeroline: false,
            showline: false,
            linecolor: "black",
            gridcolor: "rgba(0,0,0,0.075)",
            tickfont: { color: "black", size: windowWidth <= 1080 ? 9 : 12 },
            range: [0, maxBarValue * 1.2],
            tickmode: "array",
            tickvals: tickvals,
            ticktext: tickvals.map(formatCompact),
          },
          margin: {
            t: 20,
            b: windowWidth <= 1080 ? 80 : 80,
            l: 50,
            r: windowWidth <= 1080 ? 20 : 50,
          },
          paper_bgcolor: "#f6f8fa",
          plot_bgcolor: "#f6f8fa",
          autosize: true,
          barmode: "stack",
          hovermode: "x",
          annotations: allCancersAnnotations,
          legend: {
            x: 0.5,
            y: -0.2,
            xanchor: "center",
            orientation: "h",
            font: { color: "black", size: windowWidth <= 1080 ? 10 : 12 },
          },
        }}
        config={config}
        useResizeHandler={true}
        className="plotly-responsive-plot"
        style={{ width: "100%", height: windowWidth <= 1080 ? 400 : 620 }}
      />
      <div
        style={{
          display: "flex",
          gap: "20px",
          marginTop: "20px",
          color: "black",
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
      </div>
    </div>
  );
};

export default HistogramSelectCountryShowTopCancers;
