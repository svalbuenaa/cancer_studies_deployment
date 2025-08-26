import React, { useEffect, useState } from "react";
import Plot from "react-plotly.js";
// Note: The PapaParse library could not be resolved, so we will manually fetch and parse the CSV data.

const StudiesSelectedCountryCancer = ({ csvPath }) => {
  const [data, setData] = useState([]);
  const [uniqueCountries, setUniqueCountries] = useState([]);
  const [uniqueCancers, setUniqueCancers] = useState([]);

  const [selectedCountry, setSelectedCountry] = useState("United States");
  const [selectedCancer, setSelectedCancer] = useState("Breast cancer");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(csvPath);
        const text = await response.text();
        
        // Manually parse the CSV data since PapaParse could not be resolved.
        const lines = text.split('\n').filter(line => line.trim() !== '');
        if (lines.length > 1) {
          const header = lines[0].split(',').map(h => h.trim());
          const parsedData = lines.slice(1).map(line => {
            const values = line.split(',');
            if (values.length === header.length) {
              return header.reduce((obj, key, index) => {
                obj[key] = values[index].trim();
                return obj;
              }, {});
            }
            return null;
          }).filter(d => d && d.Year && d.Articles && d.Country && d.Cancer);

          const sortedData = parsedData.sort((a, b) => a.Year - b.Year);
          setData(sortedData);

          const countries = [
            "All",
            ...new Set(sortedData.map((d) => d.Country)),
          ].sort();
          const cancers = [
            "All",
            ...new Set(sortedData.map((d) => d.Cancer)),
          ].sort();

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
      .reduce((sum, d) => sum + parseInt(d.Articles), 0)
  );

  const totalArticlesTrace = {
    x: years,
    y: totalArticlesByYear,
    type: "bar",
    name: "Total studies",
    marker: {
      color: "#99badd",
      opacity: 0.7
    },
    hovertemplate: "<b>Year:</b> %{x}<br><b>Total studies:</b> %{y}<extra></extra>",
  };

  const plotData = [totalArticlesTrace];
  let plotTitle = "Total Published Cancer studies per Year";

  if (selectedCountry !== "All" || selectedCancer !== "All") {
    let filteredData = data;
    if (selectedCountry !== "All") {
      filteredData = filteredData.filter((d) => d.Country === selectedCountry);
    }
    if (selectedCancer !== "All") {
      filteredData = filteredData.filter((d) => d.Cancer === selectedCancer);
    }

    const filteredArticlesByYear = years.map((year) =>
      filteredData
        .filter((d) => d.Year === year)
        .reduce((sum, d) => sum + parseInt(d.Articles), 0)
    );

    const filteredArticlesTrace = {
      x: years,
      y: filteredArticlesByYear,
      type: "bar",
      name: `${selectedCountry !== 'All' ? selectedCountry : ''} ${selectedCancer !== 'All' ? selectedCancer : ''} studies`,
      marker: {
        color: "#FFA500",
      },
      hovertemplate: `<b>Year:</b> %{x}<br><b>${selectedCountry !== 'All' ? selectedCountry : ''} ${selectedCancer !== 'All' ? selectedCancer : ''} studies:</b> %{y}<extra></extra>`,
    };

    plotData.push(filteredArticlesTrace);
    plotTitle = `Studies per year for selected country and cancer type`;
  }

  const annotations = plotData.flatMap((trace, traceIndex) =>
  trace.y.map((y, index) => {
    if (y === 0) return null;

    const isTotalTrace = traceIndex === 0; // first trace = total studies

    return {
      x: years[index],
      y: isTotalTrace ? y : 0, // top for total, bottom for filtered
      text: y.toString(),
      xref: 'x',
      yref: 'y',
      xanchor: 'center',
      yanchor: isTotalTrace ? 'bottom' : 'top', // total: text above bar, filtered: text bottom-aligned
      yshift: isTotalTrace ? 10 : -2, // small offset
      showarrow: false,
      font: {
        color: 'white',
        size: 12,
      },
      textangle: -90,
    };
  }).filter(a => a !== null)
);

  const config = {
    responsive: true,
    displaylogo: false,
    modeBarButtonsToRemove: [
      'zoom2d', 'pan2d', 'select2d', 'lasso2d', 'zoomIn2d', 'zoomOut2d', 'autoScale2d', 'resetScale2d', 'hoverClosestCartesian', 'hoverCompareCartesian'
    ],
  };

  return (
    <div className="plotly-responsive-plot-container" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <Plot
        data={plotData}
        layout={{
          title: {
            text: plotTitle,
            x: 0.5,
            xanchor: "center",
            font: { size: 22, color: "white" },
            y: 0.95,
          },
          xaxis: {
            title: {
              text: "Year",
              font: { color: "white", size: 16 },
            },
            tickmode: 'array',
            tickvals: years,
            ticktext: years,
            tickangle: -90,
            showgrid: false,
            zeroline: false,
            linecolor: "white",
            gridcolor: "rgba(255, 255, 255, 0.2)",
            tickfont: { color: "white" },
          },
          yaxis: {
            title: {
              text: "Number of studies",
              font: { color: "white", size: 16 },
            },
            showgrid: true,
            zeroline: false,
            showline: false,
            linecolor: "white",
            gridcolor: "rgba(255, 255, 255, 0.2)",
            tickfont: { color: "white" },
			range: [-48999, Math.max(...totalArticlesByYear) * 1.25],
          },
          margin: { t: 60, b: 150, l: 60, r: 60 },
          paper_bgcolor: "#242424",
          plot_bgcolor: "#242424",
          autosize: true,
          annotations: annotations,
          barmode: 'overlay',
          hovermode: 'x',
          legend: {
            x: 0.5,
            y: -0.2,
            xanchor: 'center',
            orientation: 'h',
            font: { color: 'white' },
          },
        }}
        config={config}
        useResizeHandler={true}
        className="plotly-responsive-plot"
      />
      <div style={{ display: "flex", gap: "20px", marginTop: "20px", color: "white" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <label htmlFor="country-select">Country:</label>
          <select id="country-select" onChange={handleCountryChange} style={{ padding: "5px", borderRadius: "5px", border: "1px solid white", backgroundColor: "#333", color: "white" }} value={selectedCountry}>
            {uniqueCountries.map((country) => (
              <option key={country} value={country}>
                {country}
              </option>
            ))}
          </select>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <label htmlFor="cancer-select">Cancer:</label>
          <select id="cancer-select" onChange={handleCancerChange} style={{ padding: "5px", borderRadius: "5px", border: "1px solid white", backgroundColor: "#333", color: "white" }} value={selectedCancer}>
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
