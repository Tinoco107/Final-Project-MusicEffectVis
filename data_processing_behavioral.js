// List behavioral CSV files from the Data_sets/Behavioral_data folder.
const behavioralCSVFiles = [
  "Data_sets/Behavioral_data/CalmingSubject3.csv",
  "Data_sets/Behavioral_data/CalmingSubject4.csv",
  "Data_sets/Behavioral_data/CalmingSubject6.csv",
  "Data_sets/Behavioral_data/CalmingSubject8.csv",
  "Data_sets/Behavioral_data/CalmingSubject11.csv",
  "Data_sets/Behavioral_data/VexingSubject3.csv",
  "Data_sets/Behavioral_data/VexingSubject4.csv",
  "Data_sets/Behavioral_data/VexingSubject6.csv",
  "Data_sets/Behavioral_data/VexingSubject8.csv",
  "Data_sets/Behavioral_data/VexingSubject11.csv",
];

function processBehavioralFile(file) {
  return d3
    .csv(file, (d) => ({
      Response_Time: +d.Response_Time,
      TrialNumber: +d.TrialNumber,
      Stimulus_Letter: d.Stimulus_Letter,
      Correct_Response: d.Correct_Response,
      Response: d.Response,
    }))
    .then((rows) => {
      const basename = file.substring(file.lastIndexOf("/") + 1);
      const filenameWithoutExt = basename.replace(".csv", "");
      const parts = filenameWithoutExt.split("Subject");
      const session = parts[0] ? parts[0].trim() : "Unknown";
      const subject = parts[1] ? parts[1].trim() : "Unknown";
      rows.forEach((row) => {
        row.Session = session;
        row.Subject = subject;
      });
      return rows;
    });
}

function renderBehavioralCharts(files) {
  Promise.all(files.map(processBehavioralFile))
    .then((results) => {
      let allBehavioralData = results.flat();
      allBehavioralData.forEach((d) => {
        d.Correct =
          d.Response && d.Response.trim() !== ""
            ? d.Response.trim() === d.Correct_Response.trim()
            : false;
      });
      allBehavioralData = allBehavioralData.filter((d) => d.Response_Time > 0);
      const groups = d3.group(
        allBehavioralData,
        (d) => `${d.Subject}_${d.Session}`
      );
      groups.forEach((group) => {
        group.sort((a, b) => d3.ascending(a.TrialNumber, b.TrialNumber));
        for (let i = 0; i < group.length; i++) {
          group[i].Is_Target =
            i > 0 && group[i].Stimulus_Letter === group[i - 1].Stimulus_Letter;
        }
      });
      window.dataBehavioral = allBehavioralData;
      updateResponseDistributions();
    })
    .catch((error) => {
      console.error("Error processing behavioral data:", error);
    });
    
}

document.addEventListener("DOMContentLoaded", () => {

  // Now add the change event listener as you already have
  selectedSubject.addEventListener("change", () => {
    const subject = selectedSubject.value;
    console.log("Subject changed to:", subject);
    if (subject === "All") {
      renderBehavioralCharts(behavioralCSVFiles);
    } else {
      file = behavioralCSVFiles.filter((f) =>
        f.includes(`Subject${subject.slice(0, -1)}`)
      );
      renderBehavioralCharts(file);
    }
  });

  // Initial render (optional)
  renderBehavioralCharts(behavioralCSVFiles);
  const midpointTime = d3.max(data, d => d.time) / 2;

});
