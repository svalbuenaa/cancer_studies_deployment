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
import "./App.css";

function App() {
  const numericCsvPath = "data/Globocan_dataset_cummulative_ASR_country.csv";
  const categoryCsvPath = "data/Globocan_dataset_max_ASR_country.csv";
  const articlesCsvPath = "data/articles_year.csv";
  const articlesMostStudiedCsvPath = "data/articles_cancer_most_studied_country.csv";
  const selectedCountryCancerCsvPath = "data/articles_country_year_cancer.csv";
  const selectCancerMapCsvPath = "data/Globocan_dataset_ready_lite.csv";
  const scatterCsvPath = "data/articles_ASR_country_cancer.csv";  // ⬅️ new path

  // Lift the selectedCancer state up here
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
      <div className="content-section">
        <div className="text-content">
          <h1>Global Cancer Incidence</h1>
          <p>
            This interactive map visualizes the age-standardized cancer incidence rate (ASR) per 100,000 people across different countries. The data is based on publicly available health records and provides a snapshot of global cancer trends.
          </p>
        </div>
        <MapNumeric csvPath={numericCsvPath} />
      </div>

      <div className="content-section">
        <div className="text-content">
          <h1>Predominant Cancer Type by Country</h1>
          <p>
            This map shows the most common type of cancer diagnosed in each country, offering a different perspective on the global cancer burden.
          </p>
        </div>
        <MapCategory csvPath={categoryCsvPath} />
      </div>

      <div className="content-section">
        <div className="text-content">
          <h1>Cancer Incidence per Country by Selected Cancer</h1>
          <p>
            Select a cancer type to visualize its age-standardized incidence rate (ASR) across countries. This interactive map highlights regional differences for the chosen cancer.
          </p>
        </div>
        <SelectCancerMap csvPath={selectCancerMapCsvPath} />
      </div>

      <div className="content-section">
        <div className="text-content">
          <h1>Published Cancer Studies</h1>
          <p>
            This bar chart illustrates the number of scientific studies on cancer published each year. It provides insight into the research activity and focus over time.
          </p>
        </div>
        <ArticlesYear csvPath={articlesCsvPath} />
      </div>

      <div className="content-section">
        <div className="text-content">
          <h1>Most Studied Cancer Type per Country</h1>
          <p>
            This map highlights the most studied cancer type in each country based on the number of scientific studies published, revealing key areas of research interest.
          </p>
        </div>
        <MapMostStudied csvPath={articlesMostStudiedCsvPath} />
      </div>

      <div className="content-section">
        <div className="text-content">
          <h1>Top Cancers per Selected Country</h1>
          <p>
            Select a country to see the top 5 cancers studied over the years and the total number of studies for that country.
          </p>
        </div>
        <SelectCountryShowCancers csvPath="data/articles_country_year_cancer.csv" />
      </div>

      <div className="content-section">
        <div className="text-content">
          <h1>Selected Country Cancer Studies</h1>
          <p>
            This map shows cancer research activity for selected countries over the years, allowing analysis of focus areas and trends in scientific publications.
          </p>
        </div>
        <StudiesSelectedCountryCancer csvPath={selectedCountryCancerCsvPath} />
      </div>

      <div className="content-section">
        <div className="text-content">
          <h1>Top Contributing Countries per Cancer per Year</h1>
          <p>
            Select a cancer type to see the top 5 countries contributing the most research articles for that cancer each year.
          </p>
        </div>
        <SelectCancerShowCountries
          csvPath="data/articles_country_year_cancer.csv"
          selectedCancer={selectedCancer}
          setSelectedCancer={setSelectedCancer}
        />
      </div>

      <div className="content-section">
        <div className="text-content">
          <p>
            This line chart shows trends over time for the top 5 contributing countries for the selected cancer type.
          </p>
        </div>
        <SelectCancerShowCountriesLines
          csvPath="data/articles_country_year_cancer.csv"
          selectedCancer={selectedCancer}
        />
      </div>

      <div className="content-section">
        <div className="text-content">
          <h1>ASR vs Articles per Cancer for Selected Country</h1>
          <p>
            Select a country to see how cancer incidence rates (ASR) relate to the number of published research articles for each cancer type.
          </p>
        </div>
        <ScatterASRArticlesCancerCountry csvPath={scatterCsvPath} />
      </div>
    </div>
  );
}

export default App;
