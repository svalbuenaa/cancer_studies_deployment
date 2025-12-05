import { useState } from "react";
import ScrollToTop from './components/ScrollToTop';
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import ClinicalTrials from "./pages/ClinicalTrials";

// Import the components and image needed by the Home page content
import CancerMapSwitcher from "./components/CancerMapSwitcher";
import MapMostCommon from "./components/MapMostCommon";
import HistogramCummulativeArticlesYear from "./components/HistogramCummulativeArticlesYear";
import MapMostStudied from "./components/MapMostStudied";
import HistogramSelectCountryAndCancer from "./components/HistogramSelectCountryAndCancer";
import HistogramSelectCancerShowTopCountries from "./components/HistogramSelectCancerShowTopCountries";
import LinesSelectCancerShowTopCountries from "./components/LinesSelectCancerShowTopCountries";
import HistogramSelectCountryShowTopCancers from "./components/HistogramSelectCountryShowTopCancers";
import ScatterSelectCountryShowCancersIncidenceStudies from "./components/ScatterSelectCountryShowCancersIncidenceStudies";
import ScatterSelectCancerShowCountriesIncidenceStudies from "./components/ScatterSelectCancerShowCountriesIncidenceStudies";
import DataProcessing from "/Schema_data_processing.png";
import "./App.css";

// Import the components needed by the Clinical trials page content
import CTs_HistogramCummulativeArticlesYear from "./components/CTs_HistogramCummulativeArticlesYear";
import CTs_MapMostStudied from "./components/CTs_MapMostStudied";
import CTs_HistogramSelectCountryShowTopCancers from "./components/CTs_HistogramSelectCountryShowTopCancers";
import CTs_HistogramSelectCountryAndCancer from "./components/CTs_HistogramSelectCountryAndCancer";
import CTs_HistogramSelectCancerShowTopCountries from "./components/CTs_HistogramSelectCancerShowTopCountries";
import CTs_LinesSelectCancerShowTopCountries from "./components/CTs_LinesSelectCancerShowTopCountries";
import CTs_ScatterSelectCountryShowCancersIncidenceStudies from "./components/CTs_ScatterSelectCountryShowCancersIncidenceStudies";
import CTs_ScatterSelectCancerShowCountriesIncidenceStudies from "./components/CTs_ScatterSelectCancerShowCountriesIncidenceStudies";



// Updated to use export default function App() and removed the explicit router wrapper
export default function App() {
  // -------------------------------------------------------------------------
  // 1. Keep CSV paths and State here (App.jsx)
  // -------------------------------------------------------------------------
  const numericCsvPath = "data/Globocan_dataset_cummulative_ASR_country.csv";
  const categoryCsvPath = "data/Globocan_dataset_max_ASR_country.csv";
  const articlesCsvPath = "data/articles_year.csv";
  const articlesMostStudiedCsvPath = "data/articles_cancer_most_studied_country.csv";
  const selectedCountryCancerCsvPath = "data/articles_country_year_cancer.csv";
  const selectedCountryCancerLiteCsvPath = "data/articles_country_year_cancer_lite.csv";
  const selectCancerMapCsvPath = "data/Globocan_dataset_ready_lite.csv";
  const scatterCsvPath = "data/articles_ASR_country_cancer_percentage.csv";
  const scatterCancerCsvPath = "data/articles_ASR_country_cancer_1M.csv";

  // New CSV paths for the Clinical trials
  const CTs_articlesCsvPath = "data/CTs_articles_year.csv";
  const CTs_articlesMostStudiedCsvPath = "data/CTs_articles_cancer_most_studied_country.csv";
  const CTs_selectedCountryCancerCsvPath = "data/CTs_articles_country_year_cancer.csv";
  const CTs_selectedCountryCancerLiteCsvPath = "data/CTs_articles_country_year_cancer_lite.csv";
  const CTs_scatterCsvPath = "data/CTs_articles_ASR_country_cancer_percentage.csv";
  const CTs_scatterCancerCsvPath = "data/CTs_articles_ASR_country_cancer_1M.csv";
  

  const [selectedCancer, setSelectedCancer] = useState("Breast cancer");

  // Define props object to easily pass all necessary props to Home
  const homeProps = {
    numericCsvPath,
    categoryCsvPath,
    articlesCsvPath,
    articlesMostStudiedCsvPath,
    selectedCountryCancerCsvPath,
    selectedCountryCancerLiteCsvPath,
    selectCancerMapCsvPath,
    scatterCsvPath,
    scatterCancerCsvPath,
    selectedCancer,
    setSelectedCancer,
    DataProcessing,
    // Pass all imported components needed in Home
    CancerMapSwitcher,
    MapMostCommon,
    HistogramCummulativeArticlesYear,
    MapMostStudied,
    HistogramSelectCountryAndCancer,
    HistogramSelectCancerShowTopCountries,
    LinesSelectCancerShowTopCountries,
    HistogramSelectCountryShowTopCancers,
    ScatterSelectCountryShowCancersIncidenceStudies,
    ScatterSelectCancerShowCountriesIncidenceStudies,
  };

  // Define props object to easily pass all necessary props to Subpage
  const clinicalTrialsProps = {
	CTs_articlesCsvPath,
	CTs_articlesMostStudiedCsvPath,
	CTs_selectedCountryCancerCsvPath,
	CTs_selectedCountryCancerLiteCsvPath,
	CTs_scatterCsvPath,
	CTs_scatterCancerCsvPath,
	
    selectedCancer, // Re-using existing state/handlers if needed
    setSelectedCancer,
    // Pass all imported components needed in ClinicalTrials
	CTs_HistogramCummulativeArticlesYear,
	CTs_MapMostStudied,
	CTs_HistogramSelectCountryShowTopCancers,
	CTs_HistogramSelectCountryAndCancer,
	CTs_HistogramSelectCancerShowTopCountries,
	CTs_LinesSelectCancerShowTopCountries,
	CTs_ScatterSelectCountryShowCancersIncidenceStudies,
	CTs_ScatterSelectCancerShowCountriesIncidenceStudies,
  };

  return (
    <div
      style={{
        backgroundColor: "#f6f8fa",
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
      {/* ------------------------------------------------------------------------- */}
      {/* 2. Setup Routes to render different pages - NO Router wrapper needed now */}
      {/* ------------------------------------------------------------------------- */}
      <ScrollToTop />
	  <Routes>
        {/* Pass all content-related props to the Home component */}
        <Route path="/" element={<Home {...homeProps} />} />
        {/* Pass the new props to the ClinicalTrials component */}
        <Route path="/ClinicalTrials" element={<ClinicalTrials {...clinicalTrialsProps} />} />
      </Routes>

      {/* ------------------------------------------------------------------------- */}
      {/* 3. Keep the Footer outside the Routes if you want it on all pages */}
      {/* ------------------------------------------------------------------------- */}
      <footer
        style={{
          width: "100%",
          textAlign: "center",
          padding: "2rem 1rem",
          marginTop: "2rem",
          backgroundColor: "#f6f8fa",
          color: "black",
          fontSize: "0.9rem",
        }}
      >
        © 2025 Sergio Valbuena. This work is licensed under <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noopener noreferrer" style={{ color: "blue"}}>CC BY SA 4.0</a>
      </footer>
    </div>
  );
}