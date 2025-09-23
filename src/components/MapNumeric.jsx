import React, { useEffect, useState } from "react";
import Plot from "react-plotly.js";

const MapNumeric = ({ csvPath }) => {
  const [data, setData] = useState([]);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const countryCodeMap = {
    "Afghanistan": "AFG","Albania": "ALB","Algeria": "DZA","Angola": "AGO",
    "Argentina": "ARG","Armenia": "ARM","Australia": "AUS","Austria": "AUT",
    "Azerbaijan": "AZE","Bahamas": "BHS","Bahrain": "BHR","Bangladesh": "BGD",
    "Barbados": "BRB","Belarus": "BLR","Belgium": "BEL","Belize": "BLZ",
    "Benin": "BEN","Bhutan": "BTN","Bolivia": "BOL","Bosnia and Herzegovina": "BIH",
    "Botswana": "BWA","Brazil": "BRA","Brunei Darussalam": "BRN","Bulgaria": "BGR",
    "Burkina Faso": "BFA","Burundi": "BDI","Cabo Verde": "CPV","Cambodia": "KHM",
    "Cameroon": "CMR","Canada": "CAN","Central African Republic": "CAF","Chad": "TCD",
    "Chile": "CHL","China": "CHN","Colombia": "COL","Comoros": "COM","Congo Republic": "COG",
    "Costa Rica": "CRI","Cote d'Ivoire": "CIV","Croatia": "HRV","Cuba": "CUB",
    "Cyprus": "CYP","Czechia": "CZE","DR Congo": "COD","Denmark": "DNK","Djibouti": "DJI",
    "Dominican Republic": "DOM","Ecuador": "ECU","Egypt": "EGY","El Salvador": "SLV",
    "Eritrea": "ERI","Estonia": "EST","Eswatini": "SWZ","Ethiopia": "ETH","Fiji": "FJI",
    "Finland": "FIN","France": "FRA","French Guiana": "GUF","French Polynesia": "PYF",
    "Gabon": "GAB","Gambia": "GMB","Georgia": "GEO","Germany": "DEU","Ghana": "GHA",
    "Greece": "GRC","Guadeloupe": "GLP","Guam": "GUM","Guatemala": "GTM","Guinea": "GIN",
    "Guinea-Bissau": "GNB","Guyana": "GUY","Haiti": "HTI","Honduras": "HND","Hungary": "HUN",
    "Iceland": "ISL","India": "IND","Indonesia": "IDN","Iran": "IRN","Iraq": "IRQ",
    "Ireland": "IRL","Israel": "ISR","Italy": "ITA","Jamaica": "JAM","Japan": "JPN",
    "Jordan": "JOR","Kazakhstan": "KAZ","Kenya": "KEN","Kuwait": "KWT","Kyrgyz Republic": "KGZ",
    "Laos": "LAO","Latvia": "LVA","Lebanon": "LBN","Lesotho": "LSO","Liberia": "LBR",
    "Libya": "LBY","Lithuania": "LTU","Luxembourg": "LUX","Madagascar": "MDG","Malawi": "MWI",
    "Malaysia": "MYS","Maldives": "MDV","Mali": "MLI","Malta": "MLT","Martinique": "MTQ",
    "Mauritania": "MRT","Mauritius": "MUS","Mexico": "MEX","Micronesia, Fed. Sts.": "FSM",
    "Moldova": "MDA","Mongolia": "MNG","Montenegro": "MNE","Morocco": "MAR","Mozambique": "MOZ",
    "Myanmar": "MMR","Namibia": "NAM","Nepal": "NPL","Netherlands": "NLD","New Caledonia": "NCL",
    "New Zealand": "NZL","Nicaragua": "NIC","Niger": "NER","Nigeria": "NGA","North Korea": "PRK",
    "North Macedonia": "MKD","Norway": "NOR","Oman": "OMN","Pakistan": "PAK","Palestine": "PSE",
    "Panama": "PAN","Papua New Guinea": "PNG","Paraguay": "PRY","Peru": "PER","Philippines": "PHL",
    "Poland": "POL","Portugal": "PRT","Puerto Rico": "PRI","Qatar": "QAT","Reunion": "REU",
    "Romania": "ROU","Russia": "RUS","Rwanda": "RWA","Samoa": "WSM","Sao Tome and Principe": "STP",
    "Saudi Arabia": "SAU","Senegal": "SEN","Serbia": "SRB","Sierra Leone": "SLE","Singapore": "SGP",
    "Slovakia": "SVK","Slovenia": "SVN","Solomon Islands": "SLB","Somalia": "SOM","South Africa": "ZAF",
    "South Korea": "KOR","South Sudan": "SSD","Spain": "ESP","Sri Lanka": "LKA","St. Lucia": "LCA",
    "Sudan": "SDN","Suriname": "SUR","Sweden": "SWE","Switzerland": "CHE","Syria": "SYR",
    "Tajikistan": "TJK","Tanzania": "TZA","Thailand": "THA","Timor-Leste": "TLS","Togo": "TGO",
    "Trinidad and Tobago": "TTO","Tunisia": "TUN","Turkmenistan": "TKM","Türkiye": "TUR","Uganda": "UGA",
    "Ukraine": "UKR","United Arab Emirates": "ARE","United Kingdom": "GBR","United States": "USA",
    "Uruguay": "URY","Uzbekistan": "UZB","Vanuatu": "VUT","Venezuela": "VEN","Vietnam": "VNM",
    "Yemen": "YEM","Zambia": "ZMB","Zimbabwe": "ZWE",
  };

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
            .filter((d) => d && d.ASR && !isNaN(parseFloat(d.ASR)));
          setData(parsedData);
        }
      } catch (error) {
        console.error("Error fetching or parsing CSV:", error);
      }
    };
    fetchData();
  }, [csvPath]);

  if (data.length === 0) {
    return (
      <div style={{ color: "black", textAlign: "center", marginTop: "50px" }}>
        <p>Loading map data...</p>
      </div>
    );
  }

  const asrValues = data.map((d) => parseFloat(d.ASR));
  const minASR = Math.min(...asrValues);
  const maxASR = Math.max(...asrValues);
  const tickStep = (maxASR - minASR) / 4;
  const tickValues = [
    minASR,
    minASR + tickStep,
    minASR + 2 * tickStep,
    minASR + 3 * tickStep,
    maxASR,
  ].map((v) => parseFloat(v.toFixed(2)));

  const plotData = {
    type: "choropleth",
    locations: data.map((d) => countryCodeMap[d.Country]),
    z: asrValues,
    text: data.map((d) => d.Country),
    colorscale: [
      [0, "#FFFF66"],
      [0.25, "#FFCC33"],
      [0.5, "#FF6600"],
      [0.75, "#CC3300"],
      [1, "#800000"],
    ],
    marker: { line: { color: "black", width: 0.5 } },
    locationmode: "ISO-3",
    colorbar: {
      title: { text: "Incidence<br>(per 100,000)", font: { color: "black" } },
      thickness: 10,
      len: 0.5,
      y: -0.1,
      yanchor: "bottom",
      x: 0.5,
      xanchor: "center",
      outlinewidth: 1,
      outlinecolor: "gray",
      orientation: "h",
      tickvals: tickValues,
      ticktext: tickValues.map(String),
      tickfont: { color: "black" },
    },
    hovertemplate:
      "<b>%{text}</b><br>Cumulative incidence: %{z} per 100,000<extra></extra>",
    hoverlabel: {
      bordercolor: "rgba(0,0,0,0.7)",
      bgcolor: "rgba(255,255,255,0.7)",
      font: { color: "black" },
    },
  };

  const config = {
    modeBarButtonsToRemove: [
      "zoomInGeo","zoomOutGeo","panGeo","select2d","lasso2d",
      "autoScaleGeo","hoverClosestGeo","hoverCompareGeo",
      "zoom2d","pan2d","resetViews","select","lasso",
      "hoverClosest","hoverCompare","toggleSpikelines","sendDataToCloud"
    ],
    displaylogo: false,
    responsive: true,
    scrollZoom: true, // enable zooming
  };

  const plotTitle =
    windowWidth <= 768
      ? "Cancer incidence (<b>all cancer types</b>)<br>per country"
      : "Cancer incidence (<b>all cancer types combined</b>) per country";

  const topMargin = windowWidth <= 768 ? 120 : 60;

  return (
    <div style={{ width: "100%", position: "relative" }}>
      <Plot
        data={[plotData]}
        layout={{
          autosize: true,
          title: {
            text: plotTitle,
            x: 0.5,
            xanchor: "center",
            font: { size: 18, color: "black" },
          },
          geo: {
            projection: { type: "natural earth" },
            showframe: false,
            showcoastlines: true,
            coastlinecolor: "gray",
            oceancolor: "#f6f8fa",
            landcolor: "#f6f8fa",
            bgcolor: "#f6f8fa",
            dragmode: "zoom",
          },
          margin: { t: topMargin, b: 40, l: 10, r: 10 },
          paper_bgcolor: "#f6f8fa",
          plot_bgcolor: "#f6f8fa",
        }}
        config={config}
        useResizeHandler={true}
        style={{ width: "100%", height: windowWidth <= 768 ? 500 : 650 }}
      />
      <style jsx>{`
        .modebar {
          top: auto !important;
          bottom: 10px !important;
          right: 10px !important;
        }
      `}</style>
    </div>
  );
};

export default MapNumeric;
