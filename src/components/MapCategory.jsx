import React, { useEffect, useState } from "react";
import Plot from "react-plotly.js";
import Papa from "papaparse";

// Reuse the same color mapping
const colorMapping = {
  'Breast cancer': '#377eb8',      
  'Prostate cancer': '#4daf4a',    
  'Lung cancer': '#984ea3',        
  'Colorectal cancer': '#66c2a5',  
  'Liver cancer': '#fdbf6f',       
  'Stomach cancer': '#8da0cb',     
  'Cervical cancer': '#f781bf',    
  'Leukemia': '#a65628',           
  'Esophageal cancer': '#ffbaba',
  'Skin cancer': '#ff7f00',
  'Anal cancer': '#b15928',
  'Brain cancer': '#1f78b4', 
  'Mesothelioma': '#33a02c', 
  'Kidney cancer': '#6a3d9a', 
  'Multiple myeloma': '#e31a1c', 
  'Laryngeal cancer': '#e78ac3', 
  'Ovarian cancer': '#cab2d6',
  'Colon cancer': '#ffff99',
  'Penile cancer': '#a6cee3',  
};

// Comprehensive mapping of country names to ISO-3 codes
const countryCodeMap = {
  "Afghanistan": "AFG", "Albania": "ALB", "Algeria": "DZA", "Angola": "AGO",
  "Argentina": "ARG", "Armenia": "ARM", "Australia": "AUS", "Austria": "AUT",
  "Azerbaijan": "AZE", "Bahamas": "BHS", "Bahrain": "BHR", "Bangladesh": "BGD",
  "Barbados": "BRB", "Belarus": "BLR", "Belgium": "BEL", "Belize": "BLZ",
  "Benin": "BEN", "Bhutan": "BTN", "Bolivia": "BOL", "Bosnia and Herzegovina": "BIH",
  "Botswana": "BWA", "Brazil": "BRA", "Brunei Darussalam": "BRN", "Bulgaria": "BGR",
  "Burkina Faso": "BFA", "Burundi": "BDI", "Cabo Verde": "CPV", "Cambodia": "KHM",
  "Cameroon": "CMR", "Canada": "CAN", "Central African Republic": "CAF", "Chad": "TCD",
  "Chile": "CHL", "China": "CHN", "Colombia": "COL", "Comoros": "COM",
  "Congo Republic": "COG", "Costa Rica": "CRI", "Cote d'Ivoire": "CIV", "Croatia": "HRV",
  "Cuba": "CUB", "Cyprus": "CYP", "Czechia": "CZE", "DR Congo": "COD",
  "Denmark": "DNK", "Djibouti": "DJI", "Dominican Republic": "DOM", "Ecuador": "ECU",
  "Egypt": "EGY", "El Salvador": "SLV", "Eritrea": "ERI", "Estonia": "EST",
  "Eswatini": "SWZ", "Ethiopia": "ETH", "Fiji": "FJI", "Finland": "FIN",
  "France": "FRA", "French Guiana": "GUF", "French Polynesia": "PYF", "Gabon": "GAB",
  "Gambia": "GMB", "Georgia": "GEO", "Germany": "DEU", "Ghana": "GHA",
  "Greece": "GRC", "Guadeloupe": "GLP", "Guam": "GUM", "Guatemala": "GTM",
  "Guinea": "GIN", "Guinea-Bissau": "GNB", "Guyana": "GUY", "Haiti": "HTI",
  "Honduras": "HND", "Hungary": "HUN", "Iceland": "ISL", "India": "IND",
  "Indonesia": "IDN", "Iran": "IRN", "Iraq": "IRQ", "Ireland": "IRL",
  "Israel": "ISR", "Italy": "ITA", "Jamaica": "JAM", "Japan": "JPN",
  "Jordan": "JOR", "Kazakhstan": "KAZ", "Kenya": "KEN", "Kuwait": "KWT",
  "Kyrgyz Republic": "KGZ", "Laos": "LAO", "Latvia": "LVA", "Lebanon": "LBN",
  "Lesotho": "LSO", "Liberia": "LBR", "Libya": "LBY", "Lithuania": "LTU",
  "Luxembourg": "LUX", "Madagascar": "MDG", "Malawi": "MWI", "Malaysia": "MYS",
  "Maldives": "MDV", "Mali": "MLI", "Malta": "MLT", "Martinique": "MTQ",
  "Mauritania": "MRT", "Mauritius": "MUS", "Mexico": "MEX", "Micronesia, Fed. Sts.": "FSM",
  "Moldova": "MDA", "Mongolia": "MNG", "Montenegro": "MNE", "Morocco": "MAR",
  "Mozambique": "MOZ", "Myanmar": "MMR", "Namibia": "NAM", "Nepal": "NPL",
  "Netherlands": "NLD", "New Caledonia": "NCL", "New Zealand": "NZL", "Nicaragua": "NIC",
  "Niger": "NER", "Nigeria": "NGA", "North Korea": "PRK", "North Macedonia": "MKD",
  "Norway": "NOR", "Oman": "OMN", "Pakistan": "PAK", "Palestine": "PSE",
  "Panama": "PAN", "Papua New Guinea": "PNG", "Paraguay": "PRY", "Peru": "PER",
  "Philippines": "PHL", "Poland": "POL", "Portugal": "PRT", "Puerto Rico": "PRI",
  "Qatar": "QAT", "Reunion": "REU", "Romania": "ROU", "Russia": "RUS",
  "Rwanda": "RWA", "Samoa": "WSM", "Sao Tome and Principe": "STP", "Saudi Arabia": "SAU",
  "Senegal": "SEN", "Serbia": "SRB", "Sierra Leone": "SLE", "Singapore": "SGP",
  "Slovakia": "SVK", "Slovenia": "SVN", "Solomon Islands": "SLB", "Somalia": "SOM",
  "South Africa": "ZAF", "South Korea": "KOR", "South Sudan": "SSD", "Spain": "ESP",
  "Sri Lanka": "LKA", "St. Lucia": "LCA", "Sudan": "SDN", "Suriname": "SUR",
  "Sweden": "SWE", "Switzerland": "CHE", "Syria": "SYR", "Tajikistan": "TJK",
  "Tanzania": "TZA", "Thailand": "THA", "Timor-Leste": "TLS", "Togo": "TGO",
  "Trinidad and Tobago": "TTO", "Tunisia": "TUN", "Turkmenistan": "TKM", "Türkiye": "TUR",
  "Uganda": "UGA", "Ukraine": "UKR", "United Arab Emirates": "ARE", "United Kingdom": "GBR",
  "United States": "USA", "Uruguay": "URY", "Uzbekistan": "UZB", "Vanuatu": "VUT",
  "Venezuela": "VEN", "Vietnam": "VNM", "Yemen": "YEM", "Zambia": "ZMB", "Zimbabwe": "ZWE",
};

const MapCategory = ({ csvPath }) => {
  const [data, setData] = useState([]);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  // Track window width for responsive title
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    Papa.parse(csvPath, {
      download: true,
      header: true,
      complete: (results) => {
        const validData = results.data.filter(
          d => d.Cancer && d.ASR && !isNaN(parseFloat(d.ASR))
        );
        setData(validData);
      },
    });
  }, [csvPath]);

  if (data.length === 0) {
    return (
      <div style={{ color: "black", textAlign: "center", marginTop: "50px" }}>
        <p>Loading map data...</p>
      </div>
    );
  }

  const uniqueCancers = [...new Set(data.map(d => d.Cancer))].sort();

  const plotTraces = uniqueCancers.map(cancerType => {
    const categoryData = data.filter(d => d.Cancer === cancerType);
    const color = colorMapping[cancerType] || "#999999";

    // Trick: use two different z values to force legend display
    const zValues = categoryData.map((_, i) => i % 2); // 0,1,0,1,...

    return {
      type: "choropleth",
      locations: categoryData.map(d => countryCodeMap[d.Country]),
      z: zValues,
      text: categoryData.map(d => d.Country),
      name: cancerType,
      showscale: false,
      showlegend: true,
      marker: { line: { color: "black", width: 0.5 } },
      locationmode: "ISO-3",
      colorscale: [[0, color], [1, color]],
      hovertemplate:
        `<b>%{text}</b><br>` +
        `Highest incidence cancer: ${cancerType}<br>` +
        `Incidence: %{customdata} per 100,000<extra></extra>`,
      hoverlabel: {
        bordercolor: 'rgba(0, 0, 0, 0.7)',
        bgcolor: 'rgba(255, 255, 255, 0.7)',
        font: { color: 'black' }
      },
      customdata: categoryData.map(d => parseFloat(d.ASR)), 
    };
  });

  const config = {
    modeBarButtonsToRemove: [
      'zoomInGeo', 'zoomOutGeo', 'panGeo', 'select2d', 'lasso2d',
      'autoScaleGeo', 'hoverClosestGeo', 'hoverCompareGeo',
      'zoom2d', 'pan2d', 'resetViews', 'select', 'lasso',
      'hoverClosest', 'hoverCompare', 'toggleSpikelines', 'sendDataToCloud',
    ],
    displaylogo: false,
    modeBar: { bgcolor: 'rgba(255, 255, 255, 0)', orientation: 'h' }
  };

  // Responsive title like MapNumeric / SelectCancerMap
  const plotTitle = windowWidth <= 768
    ? "Most common cancer<br>-by incidence- per country"
    : "Most common cancer -by incidence- per country";

  return (
    <div style={{ position: "relative" }}>
      <Plot
        data={plotTraces}
        layout={{
          title: {
            text: plotTitle,
            x: 0.5,
            xanchor: "center",
            font: { size: 18, color: "black" },
            y: 0.96,
          },
          geo: {
            projection: { type: "natural earth" },
            showframe: false,
            showcoastlines: true,
            coastlinecolor: "gray",
            oceancolor: "#f6f8fa",
            landcolor: "#f6f8fa",
            bgcolor: "#f6f8fa",
          },
          margin: { t: 40, b: 100, l: 40, r: 40 },
          paper_bgcolor: "#f6f8fa",
          plot_bgcolor: "#f6f8fa",
          autosize: true,
          showlegend: true,
          legend: {
            x: 0.5,
            y: -0.02,
            xanchor: "center",
            yanchor: "top",
            orientation: "h",
            bgcolor: "rgba(255, 255, 255, 0)",
            font: { color: "black" },
          },
          legenditemclick: false,
          legenditemdoubleclick: false,
        }}
        config={config}
        useResizeHandler={true}
        className="plotly-responsive-plot"
      />
      <style jsx>{`
        .modebar {
          top: auto !important;
          bottom: -50px !important;
          right: 7% !important;
          transform: translateX(50%);
        }
      `}</style>
    </div>
  );
};

export default MapCategory;
