import { useState } from "react";
import MapNumeric from "./components/MapNumeric";
import MapCategory from "./components/MapCategory";
import ArticlesYear from "./components/ArticlesYear";
import MapMostStudied from "./components/MapMostStudied";
import StudiesSelectedCountryCancer from "./components/StudiesSelectedCountryCancer";
import SelectCancerShowCountries from "./components/SelectCancerShowCountries";
import SelectCancerShowCountriesLines from "./components/SelectCancerShowCountriesLines";
import SelectCountryShowCancers from "./components/SelectCountryShowCancers";
import SelectCancerMap from "./components/SelectCancerMap";
import ScatterASRArticlesCancerCountry from "./components/ScatterASRArticlesCancerCountry";
import ScatterASRArticlesCountryCancer from "./components/ScatterASRArticlesCountryCancer";
import "./App.css";

function App() {
  const numericCsvPath = "data/Globocan_dataset_cummulative_ASR_country.csv";
  const categoryCsvPath = "data/Globocan_dataset_max_ASR_country.csv";
  const articlesCsvPath = "data/articles_year.csv";
  const articlesMostStudiedCsvPath = "data/articles_cancer_most_studied_country.csv";
  const selectedCountryCancerCsvPath = "data/articles_country_year_cancer.csv";
  const selectCancerMapCsvPath = "data/Globocan_dataset_ready_lite.csv";
  const scatterCsvPath = "data/articles_ASR_country_cancer.csv"; 
  const scatterCancerCsvPath = "data/articles_ASR_country_cancer.csv";


  const [selectedCancer, setSelectedCancer] = useState("Breast cancer");

  return (
    <div
      style={{
        backgroundColor: "#242424",
        color: "white",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        paddingTop: "2rem",
        paddingBottom: "2rem",
        width: "100%",
      }}
		
    >
	
	
{/* Title */}

{/* Global cancer incidende, all cancers */}
      <div className="content-section">
        <div className="text-content">
          <h2>Global Cancer Incidence</h2>
          <p>
            This interactive map visualizes the age-standardized cancer incidence rate (ASR) per 100,000 people across different countries. The data is based on publicly available health records and provides a snapshot of global cancer trends.
          </p>
        </div>
        <MapNumeric csvPath={numericCsvPath} />
      </div>

{/* Most frequent cancer per country */}
      <div className="content-section">
        <div className="text-content">
          <h2>Predominant Cancer Type by Country</h2>
          <p>
            This map shows the most common type of cancer diagnosed in each country, offering a different perspective on the global cancer burden.
          </p>
        </div>
        <MapCategory csvPath={categoryCsvPath} />
      </div>
	
{/* Incidence pre country for selected cancer */}
      <div className="content-section">
        <div className="text-content">
          <h2>Cancer Incidence per Country by Selected Cancer</h2>
          <p>
            Select a cancer type to visualize its age-standardized incidence rate (ASR) across countries. This interactive map highlights regional differences for the chosen cancer.
          </p>
        </div>
        <SelectCancerMap csvPath={selectCancerMapCsvPath} />
      </div>

{/* Number of cancer studies over time */}	
      <div className="content-section">
        <div className="text-content">
          <h2>Published Cancer Studies</h2>
          <p>
            This bar chart illustrates the number of scientific studies on cancer published each year. It provides insight into the research activity and focus over time.
          </p>
        </div>
        <ArticlesYear csvPath={articlesCsvPath} />
      </div>

{/* Most studied cancer per country */}	
      <div className="content-section">
        <div className="text-content">
          <h2>Most Studied Cancer Type per Country</h2>
          <p>
            This map highlights the most studied cancer type in each country based on the number of scientific studies published, revealing key areas of research interest.
          </p>
        </div>
        <MapMostStudied csvPath={articlesMostStudiedCsvPath} />
      </div>

{/* Top studied cancers for selected country per year */}
      <div className="content-section">
        <div className="text-content">
          <h2>Top Cancers per Selected Country</h2>
          <p>
            Select a country to see the top 5 cancers studied over the years and the total number of studies for that country.
          </p>
        </div>
        <SelectCountryShowCancers csvPath={selectedCountryCancerCsvPath} />
      </div>

{/* Select country and cancer, show studies over time */}
      <div className="content-section">
        <div className="text-content">
          <h2>Selected Country Cancer Studies</h2>
          <p>
            This map shows cancer research activity for selected countries over the years, allowing analysis of focus areas and trends in scientific publications.
          </p>
        </div>
        <StudiesSelectedCountryCancer csvPath={selectedCountryCancerCsvPath} />
      </div>

{/* Top contributing countries per cancer and year */}
      <div className="content-section">
        <div className="text-content">
          <h2>Top Contributing Countries per Cancer per Year</h2>
          <p>
            Select a cancer type to see the top 5 countries contributing the most research articles for that cancer each year.
          </p>
        </div>
        <SelectCancerShowCountries
          csvPath={selectedCountryCancerCsvPath}
          selectedCancer={selectedCancer}
          setSelectedCancer={setSelectedCancer}
        />
      </div>

{/* Top contributing countries per cancer and year, line plot */}
      <div className="content-section">
        <div className="text-content">
          <p>
            This line chart shows trends over time for the top 5 contributing countries for the selected cancer type.
          </p>
        </div>
        <SelectCancerShowCountriesLines
          csvPath={selectedCountryCancerCsvPath}
          selectedCancer={selectedCancer}
        />
      </div>

{/* Incidence vs number of articles for selected country */}
      <div className="content-section">
        <div className="text-content">
          <h2>ASR vs Articles per Cancer for Selected Country</h2>
          <p>
            Select a country to see how cancer incidence rates (ASR) relate to the number of published research articles for each cancer type.
          </p>
        </div>
        <ScatterASRArticlesCancerCountry csvPath={scatterCsvPath} />
      </div>

{/* Incidence vs number of articles for selected cancer */}
      <div className="content-section">
        <div className="text-content">
          <h2>ASR vs Articles per Country for Selected Cancer</h2>
          <p>
            Select a cancer type to see how incidence rates (ASR) relate to the number of published research articles across countries. Top 5 countries are labeled.
          </p>
        </div>
        <ScatterASRArticlesCountryCancer
          csvPath={scatterCancerCsvPath}
          selectedCancer={selectedCancer}
          setSelectedCancer={setSelectedCancer}
        />
      </div>
    </div>
  );
}

export default App;
