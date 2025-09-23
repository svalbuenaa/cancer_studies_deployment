import React, { useEffect, useState } from "react";
import Plot from "react-plotly.js";

const SelectCancerShowCountriesLines = ({ csvPath, selectedCancer }) => {
  const [data, setData] = useState([]);
  const [years, setYears] = useState([]);
  const [topCountries, setTopCountries] = useState([]);

  // 🔹 Track screen width for responsive title
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

          setData(parsedData);

          const allYears = [...new Set(parsedData.map((d) => d.Year))].sort();
          setYears(allYears);

          // Compute top 5 countries for the selected cancer
          const top5 = [...new Set(parsedData.map((d) => d.Country))]
            .map((country) => {
              const total = parsedData
                .filter((d) => d.Country === country && d.Cancer === selectedCancer)
                .reduce((sum, d) => sum + parseInt(d.Articles), 0);
              return { country, total };
            })
            .sort((a, b) => b.total - a.total)
            .slice(0, 5)
            .map((d) => d.country);

          setTopCountries(top5); // keep original order for color matching
        }
      } catch (error) {
        console.error("Error fetching CSV:", error);
      }
    };

    if (selectedCancer) {
      fetchData();
    }
  }, [csvPath, selectedCancer]);

  // Generate line traces for top 5 countries
  const colors = ["#FF5733", "#19ad17", "#33e7ff", "#FF33A1", "#FFC300"];
  const plotData = topCountries.map((country, index) => {
    const yValues = years.map((year) => {
      const entry = data.find(
        (d) =>
          d.Country === country &&
          d.Cancer === selectedCancer &&
          d.Year === year
      );
      return entry ? parseInt(entry.Articles) : 0;
    });

    return {
      x: years,
      y: yValues,
      type: "scatter",
      mode: "lines+markers",
      name: country,
      line: { color: colors[index % colors.length], width: 3 },
      marker: { size: 6 },
      hovertemplate:
        `<b>Cancer:</b> ${selectedCancer}<br>` +
        `<b>Country:</b> ${country}<br>` +
        `<b>Year:</b> %{x}<br>` +
        `<b>Articles:</b> %{y}<extra></extra>`,
    };
  });

  const maxVal = Math.max(...plotData.flatMap((t) => t.y));

  const config = {
    responsive: true,
    displaylogo: false,
    modeBarButtonsToRemove: [
      "zoom2d","pan2d","select2d","lasso2d","zoomIn2d","zoomOut2d",
      "autoScale2d","resetScale2d","hoverClosestCartesian","hoverCompareCartesian",
    ],
  };

  // 🔹 Title (unchanged text, just break into 2 lines on small screens)
  const plotTitle =
    windowWidth <= 768
      ? `Countries with the highest number of <b>${selectedCancer}</b><br>studies, tendencies`
      : `Countries with the highest number of <b>${selectedCancer}</b> studies, tendencies`;

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
            tickfont: { color: "black" },
            range: [Math.min(...years) - 0.5, Math.max(...years)],
          },
          yaxis: {
            title: {
              text: "Number of articles",
              font: { color: "black", size: 16 },
              standoff: 20,
            },
            showgrid: true,
            zeroline: false,
            showline: false,
            linecolor: "black",
            gridcolor: "rgba(0,0,0,0.075)",
            tickfont: { color: "black" },
            range: [0, maxVal * 1.2],
            tickformat: "~s",
          },
          paper_bgcolor: "#f6f8fa",
          plot_bgcolor: "#f6f8fa",
          autosize: true,
          hovermode: "x",
          legend: {
            x: 0.5,
            y: -0.2,
            xanchor: "center",
            orientation: "h",
            font: { color: "black" },
            traceorder: "reversed",
          },
        }}
        config={config}
        useResizeHandler={true}
        className="plotly-responsive-plot"
      />
    </div>
  );
};

export default SelectCancerShowCountriesLines;
