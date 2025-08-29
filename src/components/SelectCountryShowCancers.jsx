import React, { useEffect, useState } from "react";
import Plot from "react-plotly.js";

const SelectCountryShowCancers = ({ csvPath }) => {
  const [data, setData] = useState([]);
  const [uniqueCountries, setUniqueCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState("Switzerland");

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
            // Filter out unwanted cancer types during data parsing
            .filter((d) => d && d.Year && d.Articles && d.Country && d.Cancer && 
              d.Cancer !== "Undetermined cancer" && 
              d.Cancer !== "Other cancer");

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

  const handleCountryChange = (event) => setSelectedCountry(event.target.value);

  const years = [...new Set(data.map((d) => d.Year))].sort();

  // Top 5 cancers by total articles for the selected country, from the already filtered data
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

  // Traces for top 5 cancers (stacked)
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

  // All cancers trace (background)
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

  // Annotations for all cancers bar
  const allCancersAnnotations = totalAllCancersY.map((y, i) => ({
    x: years[i],
    y: y,
    text: y.toString(),
    xref: "x",
    yref: "y",
    xanchor: "center",
    yanchor: "bottom",
    showarrow: false,
    font: { color: "white", size: 12 },
    textangle: -90,
  }));

  const plotData = [allCancersTrace, ...top5Traces];

  const plotTitle = `Most studied cancers in <b>${selectedCountry}</b>`;

  const maxBarValue = Math.max(...plotData.flatMap((t) => t.y));
  const rawStep = maxBarValue / 10;
  const magnitude = Math.pow(10, Math.floor(Math.log10(rawStep)));
  const step = Math.ceil(rawStep / magnitude) * magnitude;
  const upper = Math.ceil(maxBarValue / step) * step;
  const tickvals = Array.from({ length: Math.floor(upper / step) + 1 }, (_, i) => i * step);

  const formatCompact = (num) => {
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
    if (num >= 1_000) return (num / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
    return num.toString();
  };

  const config = {
    responsive: true,
    displaylogo: false,
    modeBarButtonsToRemove: [
      "zoom2d","pan2d","select2d","lasso2d","zoomIn2d","zoomOut2d",
      "autoScale2d","resetScale2d","hoverClosestCartesian","hoverCompareCartesian",
    ],
  };

  return (
    <div className="plotly-responsive-plot-container" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <Plot
        data={plotData}
        layout={{
          title: { text: plotTitle, x: 0.5, xanchor: "center", font: { size: 22, color: "white" }, y: 0.95 },
          xaxis: { title: { text: "Year", font: { color: "white", size: 16 } }, tickmode: "array", tickvals: years, ticktext: years, tickangle: -90, showgrid: false, zeroline: false, linecolor: "white", gridcolor: "rgba(255, 255, 255, 0.2)", tickfont: { color: "white" } },
          yaxis: { 
            title: { text: "Number of articles", font: { color: "white", size: 16 }, standoff: 20 },
            showgrid: true,
            zeroline: false,
            showline: false,
            linecolor: "white",
            gridcolor: "rgba(255,255,255,0.2)",
            tickfont: { color: "white" },
            range: [0, maxBarValue * 1.2],
            tickmode: "array",
            tickvals: tickvals,
            ticktext: tickvals.map(formatCompact)
          },
          margin: { t: 60, b: 150, l: 60, r: 60 },
          paper_bgcolor: "#242424",
          plot_bgcolor: "#242424",
          autosize: true,
          barmode: "stack",
          hovermode: "x",
          annotations: allCancersAnnotations,
          legend: { x: 0.5, y: -0.2, xanchor: "center", orientation: "h", font: { color: "white" } },
        }}
        config={config}
        useResizeHandler={true}
        className="plotly-responsive-plot"
      />
      <div style={{ display: "flex", gap: "20px", marginTop: "20px", color: "white" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <label htmlFor="country-select">Country:</label>
          <select
            id="country-select"
            onChange={handleCountryChange}
            style={{ padding: "5px", borderRadius: "5px", border: "1px solid white", backgroundColor: "#333", color: "white" }}
            value={selectedCountry}
          >
            {uniqueCountries.map((country) => <option key={country} value={country}>{country}</option>)}
          </select>
        </div>
      </div>
    </div>
  );
};

export default SelectCountryShowCancers;