import { useState } from "react";
import CancerMapSwitcher from "./components/CancerMapSwitcher";
import MapMostCommon from "./components/MapMostCommon";
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
  const scatterCsvPath = "data/articles_ASR_country_cancer_percentage.csv";
  const scatterCancerCsvPath = "data/articles_ASR_country_cancer_1M.csv";

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
			is projected to surpass $300B in 2026. Conversely, <a href="https://www.thelancet.com/journals/lanonc/article/PIIS1470-2045(23)00182-1/fulltext#fig1" target="_blank" rel="noopener noreferrer">a recent study published in Lancet</a> found that $24.5B were spent in cancer research in the period 2026-2020, 
			most of it in pre-clinical research. 
          </p>
		  <p>
			This project explores published scientific articles with the aim of understanding how cancer research has evolved over time, which cancer types receive more scientific attention, and how different countries contribute to cancer research. The entry point for the project is a
			dataset containing <b>over 4 million scientific articles</b>, built from <a href="https://pubmed.ncbi.nlm.nih.gov/about" target="_blank" rel="noopener noreferrer">PubMed</a>, the scientific research database of the United States National Institutes of Health. The current version of this webpage contains scientific
			articles published between 1984 and July 2024 (with some exceptions) and will be updated soon to include every article on cancer available in PubMed. 
		  </p>
		  
		  <p>
			The curation of the dataset involved extracting information from the title, abstract and keywords of each scientific publication, the cancer type studied in the article (if available) and the country where the institution of the last author of the article resides. The final dataset contains 4.33M articles.
			In parallel, a second dataset containing data about incidence for 37 cancer types in 185 countries was obtained from the <a href="https://gco.iarc.fr/en" target="_blank" rel="noopener noreferrer">Global Cancer Observatory</a> (Globocan). Data displayed in this page correspond to the 2022 
			version of the <a href="https://gco.iarc.who.int/media/globocan/factsheets/populations/900-world-fact-sheet.pdf" target="_blank" rel="noopener noreferrer">"Cancer Today"</a> dataset of Globocan. Data about cancer incidence are correlated with numbers of cancer studies in each country.
			More information about the data preparation process can be found in the <a href="#data-preparation">Data retrieval and preparation</a> section of this page. Finally, 
			to know where this project is headed and how you can contribute to it, see the <a href="#what-comes-next">What comes next?</a> section. 
		  </p>
        </div>
      </div>
	  
	  
	  
      {/* Global + selected cancer incidence combined */}
      <div className="content-section">
        <div className="text-content">
          <h2>Global cancer incidence</h2>
          <p>
            Cancer incidence varies with age, cancer type and is different in different countries. <b>All incidence data shown in this page correspond to </b><a href="https://www.statcan.gc.ca/en/dai/btd/asr" target="_blank" rel="noopener noreferrer"><b>Age-Standardized incidence Rates (ASR)</b></a><b>, normalized by 100K people </b>. ASR
			values compensate for differences in age structures between countries and, therefore, allow comparisons to be made in a more precise way. In the map below you can visualize either the cummulative incidence values for all cancers combined or selected country. Incidence values are provided as rates per 100.000 people,
			allowing to compare between countries with different populations. Use the 
		    the selector above the map to switch views. In the <i>Selected cancer incidende</i> view, you can use the dropdown at the bottom of the map to choose the cancer type of your interest. <b>Hover on
			the countries to see their incidence values</b>. It is possible to <b>zoom on the map to get a closer view of areas of interest</b> and use the buttons on the top left 
			to <b>download the plot as a PNG image or to reset the zoom</b>.
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
            The predominant cancer type -by incidence- varies between countries. Whereas in most western countries, as well as part of Africa and Asia, 
			<b>breast cancer</b> has the largest incidence rates, <b>prostate and cervical (uterus) cancer</b> predominate in South America and center-south of Africa.
			The map below shows the most common type of cancer diagnosed in each country, together with its associated incidence rate.
          </p>
        </div>
        <MapMostCommon csvPath={categoryCsvPath} />
      </div>

      {/* Number of cancer studies over time */}
      <div className="content-section">
        <div className="text-content">
          <h2>Published cancer studies over time</h2>
          <p>
            Out of the 4.54M scientific articles contained in this dataset, more than 1M were published between 2019 and 2023. This corresponds to a
			2X increase with respect to the same period 10 years before. The bar chart below illustrates the number of scientific studies on cancer published each year. 
            It provides insight into the research activity and focus over time. Note that <i>data for 2024 and 2025 are still being incorporated into the dataset and do
			not reflect final values for these years</i>. 
          </p>
        </div>
        <ArticlesYear csvPath={articlesCsvPath} />
      </div>

      {/* Most studied cancer per country */}
      <div className="content-section">
        <div className="text-content">
          <h2>Most Studied Cancer Type per Country</h2>
          <p>
            Research does not pay the same attention to all cancer types. This map highlights the most studied cancer type in each country based on the number of 
            scientific studies published. A quick comparison to the previous map shows that, in general, more research is dedicated in each countries to the 
			cancer with highest incidence. Hover on the map to see the most studied cancer and how many studies were published for this cancer type in each country.
          </p>
        </div>
        <MapMostStudied csvPath={articlesMostStudiedCsvPath} />
      </div>

      {/* Top cancers per selected country */}
      <div className="content-section">
        <div className="text-content">
          <h2>Top Cancers per Selected Country</h2>
          <p>
            Probably motivated by differences in incidence and prevalence, certain cancer types are significantly more studied than others. As 
			has been <a href="https://media.nature.com/original/magazine-assets/d41586-023-02609-2/d41586-023-02609-2.pdf" target="_blank" rel="noopener noreferrer">recently published</a>,
			<b>important imbalances exist in research output for different cancer types</b>. According to the <a href="https://www.thelancet.com/journals/lanonc/article/PIIS1470-2045(23)00182-1/fulltext#fig1" target="_blank" rel="noopener noreferrer">Lancet study mentioned earlier</a>, only 6 major cancer types
			(breast, blood-related, brain, lung, prostate and colorectal) receive the vast majority of funding, a fact that is reflected in the number
			of publications studying these cancer types. In the bar chart below, <b>select a country</b> to see the <b>top 5 cancers studied over the years</b> (five colored stacked bars) and the total number of 
            studies for <span style={{ color: '#4682B4' }}><b>all cancers combined in that country</b></span>{' '} (total number of studies on top).
          </p>
        </div>
        <SelectCountryShowCancers csvPath={selectedCountryCancerCsvPath} />
      </div>

      {/* Selected country cancer studies */}
      <div className="content-section">
        <div className="text-content">
          <h2>Research outputs per country and cancer type</h2>
          <p>
            Another important imbalance exists in the contribution of different countries to cancer research. As an example, <b>United States
			has produced around 30% of all studies on breast cancer</b>. In the bar chart below, <b>select a cancer type and a country</b> to see how many articles 
			have been published per year by institutions in <span style={{ color: '#FFA500' }}><b>this country for this specific cancer type</b></span>{' '} (values shown below the bar). As a comparison, 
			the number of studies published in <span style={{ color: '#4682B4' }}><b>all countries combined for this cancer type</b></span>{' '} (values shown above the bar) are displayed.
          </p>
        </div>
        <StudiesSelectedCountryCancer csvPath={selectedCountryCancerCsvPath} />
      </div>

      {/* Top contributing countries per cancer per year */}
      <div className="content-section">
        <div className="text-content">
          <h2>(Shifting?) Research hubs</h2>
          <p>
            A small number of countries publish most cancer research. Only 5 out of 185 countries -United States, China, United Kingdom, Japan and Italy have 
			published 58% of all articles about cancer. In the bar chart below, select a cancer type to see which are the top 5 countries by number of articles about this cancer type (stacked colored bars) and how
			their contributions have changed over time. As a reference, the dark blue bar in the back shows the <span style={{ color: '#4682B4' }}><b>total number of studies for this cancer type by all countries</b></span>{' '} (values above the bars). <i>Note that, 
			upon selecting a cancer type, the updated bar chart will appear after a few seconds</i>.
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
            Historically, western countries and Japan have led scientific research in many areas, including cancer. In the last decade,
			however, research hubs are reorganizing and other countries are gaining traction and even surpasing their western counterparts.
			The most obvious example is <b>China, which in 1993 published 1% of all articles on breast cancer whereas in 2023 this value grew to 
			20%</b>. In 2020, China surpased the United States as the country publishing more studies on breast cancer. A similar phenomenon has
			taken place for many other cancer types.
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
          <h2>Under- or over-studied?</h2>
		  <p>
			The most frequently studied cancer in each country usually corresponds to the cancer
			with the highest incidence. However, some cancer types attract disproportionately more
			or less research attention relative to how often they occur.
		  </p>
		  <p>
			In the scatter plot below, <b>select a country</b> to compare the
			<b> proportion of studies versus incidence</b> for each cancer
			type in that country. <b>Dots below the dashed line</b> represent cancers that receive <i>less</i> scientific attention than expected given their relative 
			incidence. For example, breast cancer (blue dot) in Switzerland accounts for over 19% of all new cancer cases in the country, but only 15% of studies are
			dedicated to studying it. <b>Conversely, dots above the dashed line</b> represent cancers that receive <i>more</i> scientific attention than expected 
			relative to their relative incidence. In Switzerland, an example could be Leukemia, which has a relative incidence of only 2% of all cancers whereas 10% of 
			studies published in the country study this specific cancer. The 3 cancer types with more studies in the selected country are highlighed in color.
		  </p>
        </div>
        <ScatterASRArticlesCancerCountry csvPath={scatterCsvPath} />
      </div>

      <div className="content-section">
        <div className="text-content">
          <h2>Top relative contributors</h2>
          <p>
            More populated countries, such as China or United States, generate most scientific output. To understand this output
			accounting for differences in population between countries, the plot below represents the <b>incidence of a selected canceer vs 
			the number of scientific articles for each country normalized by population</b>. The value in the y axis represents the number of articles about this 
			cancer type published per country and per 1M inhabitants. A new picture emerges from this plot, showing a larger variability
			associated with different cancer types in which more European countries, especially in the northern part of the continent, 
			have larger relative contributions, according to their country populations, to cancer research. <b>Use the dropdown below the plot
			to select other cancer types</b>. The 3 countries with more studies per 1M inhabitants for the selected cancer type are highlighed in color.
			To facilitate the visualization, only countries with more than 1M inhabitants are plotted. <i>Note 
			that, upon selecting a cancer type, the updated bar chart will appear after a few seconds</i>.
          </p>
        </div>
        <ScatterASRArticlesCountryCancer
          csvPath={scatterCancerCsvPath}
          selectedCancer={selectedCancer}
          setSelectedCancer={setSelectedCancer}
        />
      </div>
		
      {/* What comes next */}
      <div id="what-comes-next" className="content-section">
        <div className="text-content">
          <h2>What comes next?</h2>
          <p>
            The main dataset employed to build this page contains information about 4M+ scientific articles on cancer. Here, information 
			about <b>cancer type, year and country</b> has been included. With this relatively small feature space the information which can be extracted is 
			already very rich. Future iterations of the project with vastly expand this feature space, allowing for a much more fine-grained analysis 
			allowing, for instance, to understand how researchers from different countries collaborate to study cancer, or which factors determine
			relevant aspects of the scientific outcome, like the journal where it is published.
          </p>
		  <p>
            In parallel, the dataset is ever-expanding. Even though it is (mostly) focused on the years 1984 to 2024, the dates covered are being expanded. 
			The goal is to build an up-to-date dataset which allows to understand the latest trends in cancer research as well as to understand how this 
			research evolves.
          </p>
		  <p>
            <b>How can you contribute?</b>. You can contact me at <b>svalbuenaa@gmail.com</b>. Drop me a message if:<br />
			1.- You would like to <b>use the full dataset for a research project</b> instead of just interacting with the aggregated data displayed in the page.<br />
			2.- You identify a <b>feature you would like to have implemented or there is a question you are interested in</b> and you believe this dataset could help answering it.<br />  
			3.- There is something you would like to see better explained, or you see an <b>error in the page</b>.<br />
			4.- You would like to <b>participate in further validating the data</b> contained in the dataset.
          </p>
		  <p>
            <b>Other ongoing projects: Semantic search for scientific articles</b>. When you type a query in most search engines of scientific articles (including PubMed),
			the page uses a method called <a href="https://hslguides.osu.edu/pubmed/automatic-term-mapping" target="_blank" rel="noopener noreferrer"><b>Automatic Term Mapping (ATM)</b></a> to convert the words in your query to terms that can be searched for in their articles' databases.
			This method is fast and efficient, but not particularly flexible. <i>What if the terms you are looking for are not contained in their dictionaries? What if you are looking for something 
			very specific, with a long and complex query?</i> Results are most likely going to be suboptimal. In the next few months I will be <b>releasing an 
			alternative search engine for scientific articles based on semantics -that is, what the article is actually about-, rather than on keywords</b>. The idea
			is to <b>move away from keywords into a richer search space that allows looking for articles in a nuanced, deeper way</b>. Stay tuned!
          </p>
        </div>
		
	  {/* Data retrieval and preparation */}
	  <div id="data-preparation" className="content-section">
        <div className="text-content">
          <h2>Data retrieval and preparation</h2>
          <p>
            Below, a scheme of the data preparation is depicted. Data about incidence for different cancer types were collected from the Globocan repository, and then combined into a single dataset. 
			Data about scientific publications were obtained from PubMed using the EDirect tool, parsed and cleaned. Cancer types and country where the institution of the last author resides 
			where obtained using a multi-step approach. When the studied cancer type could not be identified in an article (for instance, if the article dealt with basic molecular aspects of cancer in general), it would be assigned to <i>Undetermined cancer</i>. 
			When the cancer type studied in the article was not in the Globocan dataset (see below), it would be assigned to <i>Other cancers</i>. Upon preparation of both datasets, they were homogeneized to prepare the visualization.
          </p>
		  <img
			src={DataProcessing} 
			alt="Data retrieval and preparation schema" 
			style={{ maxWidth: "100%", height: "auto" }}
		  />
        </div>
      </div>
	  
	  {/* Footer */}
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
    </div>
  );
}

export default App;
