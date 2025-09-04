import { useState } from "react";
import CancerMapSwitcher from "./components/CancerMapSwitcher";
import MapCategory from "./components/MapCategory";
import ArticlesYear from "./components/ArticlesYear";
import MapMostStudied from "./components/MapMostStudied";
import StudiesSelectedCountryCancer from "./components/StudiesSelectedCountryCancer";
import SelectCancerShowCountries from "./components/SelectCancerShowCountries";
import SelectCancerShowCountriesLines from "./components/SelectCancerShowCountriesLines";
import SelectCountryShowCancers from "./components/SelectCountryShowCancers";
import ScatterASRArticlesCancerCountry from "./components/ScatterASRArticlesCancerCountry";
import ScatterASRArticlesCountryCancer from "./components/ScatterASRArticlesCountryCancer";
import DataProcessing from "/Schema_data_processing.svg";
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
      {/* Title */}
	  <div className="content-section">
        <div className="text-content">
          <h1>40(+) years of cancer studies</h1>
		  <h2>How cancer science changes over time, and who shapes these changes</h2>
		  <h3>Sergio Valbuena - <a href="https://svalbuenaa.github.io" target="_blank" rel="noopener noreferrer">About</a></h3>
          <p>
			Cancer is the cause of <a href="https://www.who.int/news-room/fact-sheets/detail/cancer" target="_blank" rel="noopener noreferrer">1 out of every 6 deaths worldwide</a> (10 million only in 2020), 
			and will affect <a href="https://www.cancer.org/cancer/risk-prevention/understanding-cancer-risk/lifetime-probability-of-developing-or-dying-from-cancer.html" target="_blank" rel="noopener noreferrer">2 out of 5 people over their lifetimes</a>.
			Cancer medicine spending <a href="https://www.iqvia.com/insights/the-iqvia-institute/reports-and-publications/reports/global-oncology-trends-2024" target="_blank" rel="noopener noreferrer">reached $225B in 2023</a> and 
			is projected to surpass $300B in 2026. Conversely, <a href="https://www.thelancet.com/journals/lanonc/article/PIIS1470-2045(23)00182-1/fulltext#fig1" target="_blank" rel="noopener noreferrer">a recent study</a> found that $24.5B were spent in cancer research in the period 2026-2020, 
			most of it in pre-clinical research. 
          </p>
		  <p>
			This project explores published scientific articles with the aim of understanding how cancer research has evolved over time, which cancer types receive more scientific attention, and how different countries contribute to cancer research. The entry point for the project is a
			dataset containing <b>over 4 million scientific articles</b>, built from <a href="https://pubmed.ncbi.nlm.nih.gov/about" target="_blank" rel="noopener noreferrer">PubMed</a>, the scientific research database of the United States National Institutes of Health. The current version of this webpage contains scientific
			articles pulished between 1984 and July 2024 (with some exceptions) and will be updated soon to include every article on cancer available in PubMed. 
		  </p>
		  
		  <p>
			The curation of the dataset involved extracting information from the title, abstract and keywords of each scientific publication, the cancer type studied in the article (if available) and the country where the institution of the last author of the article resides. 
			In parallel, a second dataset containing data about incidence for 37 cancer types in 185 countries was obtained from the <a href="https://gco.iarc.fr/en" target="_blank" rel="noopener noreferrer">Global Cancer Observatory</a> (Globocan). Data displayed in this page correspond to the 2022 
			version of the <a href="https://gco.iarc.who.int/media/globocan/factsheets/populations/900-world-fact-sheet.pdf" target="_blank" rel="noopener noreferrer">"Cancer Today"</a> dataset of Globocan. Data about cancer incidence are correlated with numbers of cancer studies in each country.
			More information about the data preparation process can be found in the <a href="#data-preparation">Data retrieval and preparation</a> section of this page.
		  </p>
        </div>
      </div>
	  
	  
	  
      {/* Global + selected cancer incidence combined */}
      <div className="content-section">
        <div className="text-content">
          <h2>Global Cancer Incidence</h2>
          <p>
            Cancer incidence varies with age, cancer type and is different in different countries. <b>All data shown in this page correspond to </b><a href="https://www.statcan.gc.ca/en/dai/btd/asr" target="_blank" rel="noopener noreferrer"><b>Age-Standardized incidence Rates (ASR)</b></a><b>, normalized by 100K people </b>. ASR
			values compensate for differences in age structures between countries and, therefore, allow comparisons to be made in a more precise way. In the map below you can visualize either the cummulative incidence values for all cancers combined or selected country. Use the 
		    the selector above the map to switch views. In the <i>Selected cancer incidende</i> view, you can use the dropdown at the bottom of the map to choose the cancer type of your interest.
          </p>
        </div>
        <CancerMapSwitcher
          numericCsvPath={numericCsvPath}
          selectCancerCsvPath={selectCancerMapCsvPath}
        />
      </div>

      {/* Most frequent cancer per country */}
      <div className="content-section">
        <div className="text-content">
          <h2>Predominant Cancer Type by Country</h2>
          <p>
            This map shows the most common type of cancer diagnosed in each country, offering 
            a different perspective on the global cancer burden.
          </p>
        </div>
        <MapCategory csvPath={categoryCsvPath} />
      </div>

      {/* Number of cancer studies over time */}
      <div className="content-section">
        <div className="text-content">
          <h2>Published Cancer Studies</h2>
          <p>
            This bar chart illustrates the number of scientific studies on cancer published each year. 
            It provides insight into the research activity and focus over time.
          </p>
        </div>
        <ArticlesYear csvPath={articlesCsvPath} />
      </div>

      {/* Most studied cancer per country */}
      <div className="content-section">
        <div className="text-content">
          <h2>Most Studied Cancer Type per Country</h2>
          <p>
            This map highlights the most studied cancer type in each country based on the number of 
            scientific studies published, revealing key areas of research interest.
          </p>
        </div>
        <MapMostStudied csvPath={articlesMostStudiedCsvPath} />
      </div>

      {/* Top cancers per selected country */}
      <div className="content-section">
        <div className="text-content">
          <h2>Top Cancers per Selected Country</h2>
          <p>
            Select a country to see the top 5 cancers studied over the years and the total number of 
            studies for that country.
          </p>
        </div>
        <SelectCountryShowCancers csvPath={selectedCountryCancerCsvPath} />
      </div>

      {/* Selected country cancer studies */}
      <div className="content-section">
        <div className="text-content">
          <h2>Selected Country Cancer Studies</h2>
          <p>
            This map shows cancer research activity for selected countries over the years, allowing 
            analysis of focus areas and trends in scientific publications.
          </p>
        </div>
        <StudiesSelectedCountryCancer csvPath={selectedCountryCancerCsvPath} />
      </div>

      {/* Top contributing countries per cancer per year */}
      <div className="content-section">
        <div className="text-content">
          <h2>Top Contributing Countries per Cancer per Year</h2>
          <p>
            Select a cancer type to see the top 5 countries contributing the most research articles 
            for that cancer each year.
          </p>
        </div>
        <SelectCancerShowCountries
          csvPath={selectedCountryCancerCsvPath}
          selectedCancer={selectedCancer}
          setSelectedCancer={setSelectedCancer}
        />
      </div>

      {/* Line chart of top contributing countries */}
      <div className="content-section">
        <div className="text-content">
          <p>
            This line chart shows trends over time for the top 5 contributing countries 
            for the selected cancer type.
          </p>
        </div>
        <SelectCancerShowCountriesLines
          csvPath={selectedCountryCancerCsvPath}
          selectedCancer={selectedCancer}
        />
      </div>

      {/* Scatter plots */}
      <div className="content-section">
        <div className="text-content">
          <h2>ASR vs Articles per Cancer for Selected Country</h2>
          <p>
            Select a country to see how cancer incidence rates (ASR) relate to the number of 
            published research articles for each cancer type.
          </p>
        </div>
        <ScatterASRArticlesCancerCountry csvPath={scatterCsvPath} />
      </div>

      <div className="content-section">
        <div className="text-content">
          <h2>ASR vs Articles per Country for Selected Cancer</h2>
          <p>
            Select a cancer type to see how incidence rates (ASR) relate to the number of 
            published research articles across countries. Top 5 countries are labeled.
          </p>
        </div>
        <ScatterASRArticlesCountryCancer
          csvPath={scatterCancerCsvPath}
          selectedCancer={selectedCancer}
          setSelectedCancer={setSelectedCancer}
        />
      </div>
	  
	  {/* Data retrieval and preparation */}
	  <div id="data-preparation" className="content-section">
        <div className="text-content">
          <h2>Data retrieval and preparation</h2>
          <p>
            Select a cancer type to see how incidence rates (ASR) relate to the number of 
            published research articles across countries. Top 5 countries are labeled.
          </p>
		  <img
			src={DataProcessing} 
			alt="Data retrieval and preparation schema" 
		  />
        </div>
        
      </div>
	  
    </div>
  );
}

export default App;
