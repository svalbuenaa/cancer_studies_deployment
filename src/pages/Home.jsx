import React from "react";
import MapNumeric from "../components/MapNumeric";
import MapCategory from "../components/MapCategory";

const Home = () => {
  return (
    <div className="flex flex-col gap-12 p-4">
      <MapNumeric csvPath="/data/Globocan_dataset_cummulative_ASR_country.csv" />
      <MapCategory csvPath="/data/Globocan_dataset_max_ASR_country.csv" />
    </div>
  );
};

export default Home;