import React from "react";
import { Link } from "react-router-dom";

const ClinicalTrials = (props) => {
  // Destructure the new CSV paths from props
  const {
    CTs_articlesCsvPath,
	CTs_articlesMostStudiedCsvPath,
	CTs_selectedCountryCancerCsvPath,
	CTs_selectedCountryCancerLiteCsvPath,
	CTs_scatterCsvPath,
	CTs_scatterCancerCsvPath,
	
    selectedCancer,
    setSelectedCancer,
	// Components
	CTs_HistogramCummulativeArticlesYear,
	CTs_MapMostStudied,
	CTs_HistogramSelectCountryShowTopCancers,
	CTs_HistogramSelectCountryAndCancer,
	CTs_HistogramSelectCancerShowTopCountries,
	CTs_LinesSelectCancerShowTopCountries,
	CTs_ScatterSelectCountryShowCancersIncidenceStudies,
	CTs_ScatterSelectCancerShowCountriesIncidenceStudies,
  } = props;

  return (
    <div style={{ width: "100%", maxWidth: "1200px" }}>
	  {/* Title */}
      <div className="content-section">
        <div className="text-content">
          <h1>Cancer research explorer</h1>
          <h2>Clinical trials</h2>
		  <h3>Sergio Valbuena - <a href="https://svalbuenaa.github.io" target="_blank" rel="noopener noreferrer">About</a></h3>
		  <Link to="/" style={{ color: '#007bff', fontWeight: 'bold' }}>
			Go back to the main dashboard
		  </Link>
          
          <p>
            Cancer is the cause of <a href="https://www.who.int/news-room/fact-sheets/detail/cancer" target="_blank" rel="noopener noreferrer">1 out of every 6 deaths worldwide</a> (10 million only in 2020),
            and will affect <a href="https://www.cancer.org/cancer/risk-prevention/understanding-cancer-risk/lifetime-probability-of-developing-or-dying-from-cancer.html" target="_blank" rel="noopener noreferrer">2 out of 5 people over their lifetimes</a>.
            Cancer medicine spending <a href="https://www.iqvia.com/insights/the-iqvia-institute/reports-and-publications/reports/global-oncology-trends-2024" target="_blank" rel="noopener noreferrer">reached $225B in 2023</a> and
            is projected to surpass $300B in 2026. Conversely, <a href="https://www.thelancet.com/journals/lanonc/article/PIIS1470-2045(23)00182-1/fulltext#fig1" target="_blank" rel="noopener noreferrer">a recent study published in Lancet</a> found that $24.5B were spent in cancer research in the period 2026-2020,
            most of it in pre-clinical research.
          </p>
          <p>
            This section of the project explores published clinical trials with the aim of understanding the evolution of cancer clinical research. It employs a
            subset of the main dataset, containing <b>over 160 thousand published clinical trial articles</b>, built from <a href="https://pubmed.ncbi.nlm.nih.gov/about" target="_blank" rel="noopener noreferrer">PubMed</a>, the scientific research database of the United States National Institutes of Health. The current version of this webpage contains scientific
            information extracted from virtually all clinical trial articles published from 1984 (currently up to September 2025).
          </p>

          <p>
            To better put the dataset into the context of cancer impact, information extracted from the clinical trial articles was matched with incidence data (as of 2022) for 37 cancer types in 185 countries obtained from the <a href="https://gco.iarc.fr/en" target="_blank" rel="noopener noreferrer">Global Cancer Observatory</a> (Globocan). More
            information about the data preparation process can be found in the <b>Data retrieval and preparation</b> section of the <Link to="/" style={{ color: '#007bff', fontWeight: 'bold' }}>main page</Link>.
          </p>
        </div>
      </div>
	  
	    
	  
	  
	  {/* Number of cancer studies over time */}
      <div className="content-section">
        <div className="text-content">
          <h2>Published cancer studies over time</h2>
          <p>
            Out of the 4.7M+ scientific articles contained in this dataset, more than 1M were published between 2019 and 2023. This corresponds to a
            2X increase with respect to the same period 10 years before. The bar chart below shows the number of scientific studies on cancer published each year.
            An upward trend can be identified between 1984 and 2021, which has been halted probably as a consequence of COVID.<b><i> Note that data for 2025 are still incomplete and do
            not reflect final values for this year. Some articles which will be published in 2026 are already available in PubMed and have been incorporated to the dataset</i></b>.
          </p>
        </div>
        <CTs_HistogramCummulativeArticlesYear csvPath={CTs_articlesCsvPath} />
      </div>
	  
	  
	  {/* Most studied cancer per country */}
      <div className="content-section">
        <div className="text-content">
          <h2>Most studied cancer type by country</h2>
          <p>
            Research does not pay the same attention to all cancer types. This map highlights the most studied cancer type in each country based on the number of
            scientific studies published. A quick comparison to the previous map shows that, in general, more research is dedicated in each country to the
            cancer with highest incidence. Hover on the map to see the most studied cancer and how many studies were published for this cancer type in each country.
          </p>
        </div>
        <CTs_MapMostStudied csvPath={CTs_articlesMostStudiedCsvPath} />
      </div>
	  
	  {/* Top cancers per selected country */}
      <div className="content-section">
        <div className="text-content">
          <h2>Evolution of most studied cancers by country</h2>
          <p>
            Probably motivated by differences in incidence and prevalence, certain cancer types are significantly more studied than others. As
            has been <a href="https://media.nature.com/original/magazine-assets/d41586-023-02609-2/d41586-023-02609-2.pdf" target="_blank" rel="noopener noreferrer">recently published</a>, <b>important
            imbalances exist in research output for different cancer types</b>. According to the <a href="https://www.thelancet.com/journals/lanonc/article/PIIS1470-2045(23)00182-1/fulltext#fig1" target="_blank" rel="noopener noreferrer">Lancet study mentioned earlier</a>, only 6 major cancer types
            (breast, blood-related, brain, lung, prostate and colorectal) receive the vast majority of funding, a fact that is reflected in the number
            of publications studying these cancer types. In the bar chart below, <b>select a country</b> to see the <b>top 5 cancers studied over the years</b> (five colored stacked bars) and the total number of
            studies for <span style={{ color: '#4682B4' }}><b>all cancers combined in that country</b></span>{' '} (total number of studies on top).
          </p>
        </div>
        <CTs_HistogramSelectCountryShowTopCancers csvPath={CTs_selectedCountryCancerCsvPath} />
      </div>
	  
	  
	  {/* Selected country cancer studies */}
      <div className="content-section">
        <div className="text-content">
          <h2>Research produced per country and cancer type</h2>
          <p>
            Another important imbalance exists in the contribution of different countries to cancer research. As an example, <b>United States
            has produced around 30% of all studies on breast cancer</b>. In the bar chart below, <b>select a cancer type and a country</b> to see how many articles
            have been published per year by institutions in <span style={{ color: '#FFA500' }}><b>this country for this specific cancer type</b></span>{' '} (values shown below the bar). As a comparison,
            the number of studies published in <span style={{ color: '#4682B4' }}><b>all countries combined for this cancer type</b></span>{' '} (values shown above the bar) are displayed.
          </p>
        </div>
        <CTs_HistogramSelectCountryAndCancer csvPath={CTs_selectedCountryCancerCsvPath} />
      </div>
	  
	  
	  {/* Top contributing countries per cancer per year */}
      <div className="content-section">
        <div className="text-content">
          <h2>(Shifting?) Research hubs</h2>
          <p>
            A small number of countries publish most cancer research. Only 5 out of 185 countries (United States, China, United Kingdom, Japan and Italy) have
            published 58% of all articles about cancer. In the bar chart below, select a cancer type to see which are the top 5 countries by number of articles about this cancer type (stacked colored bars) and how
            their contributions have changed over time. As a reference, the dark blue bar in the back shows the <span style={{ color: '#4682B4' }}><b>total number of studies for this cancer type by all countries</b></span>{' '} (values above the bars).
          </p>
        </div>
        <CTs_HistogramSelectCancerShowTopCountries
          csvPath={CTs_selectedCountryCancerLiteCsvPath}
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
            taken place for many other cancer types. In the line chart below, <b>select a cancer type to see how the number of articles published by the top 5
            countries have evolved for this cancer type</b>.
          </p>
        </div>
        <CTs_LinesSelectCancerShowTopCountries
          csvPath={CTs_selectedCountryCancerLiteCsvPath}
          selectedCancer={selectedCancer}
        />
      </div>
	  
	  
	  {/* Scatter plot per country incidence vs studies */}
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
        <CTs_ScatterSelectCountryShowCancersIncidenceStudies csvPath={CTs_scatterCsvPath} />
      </div>
	  
	  
	  {/* Scatter plot per cancer incidence vs studies */}
      <div className="content-section">
        <div className="text-content">
          <h2>Top relative contributors</h2>
          <p>
            More populated countries, such as China or United States, generate most scientific output. To understand this output while
            accounting for differences in population between countries, the plot below represents the <b>incidence of a selected cancer vs
            the number of scientific articles for each country normalized by population</b>. The value in the y axis represents the number of articles about this
            cancer type published per country and per 1M inhabitants. A new picture emerges from this plot, showing a larger variability
            associated with different cancer types in which European countries, especially in the northern part of the continent,
            have larger relative contributions, according to their country populations, to cancer research. <b>Use the dropdown below the plot
            to select other cancer types</b>. The 3 countries with more studies per 1M inhabitants for the selected cancer type are highlighed in color.
            To facilitate the visualization, only countries with more than 1M inhabitants are plotted.
          </p>
        </div>
        <CTs_ScatterSelectCancerShowCountriesIncidenceStudies
          csvPath={CTs_scatterCancerCsvPath}
          selectedCancer={selectedCancer}
          setSelectedCancer={setSelectedCancer}
        />
      </div>
		  
		  
	  <div className="content-section">
		 <Link to="/" style={{ color: '#007bff', fontWeight: 'bold' }}>
			Go back to the main dashboard
		 </Link>
	  </div>
    </div>
  );
};

export default ClinicalTrials;