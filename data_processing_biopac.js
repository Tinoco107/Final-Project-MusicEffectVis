// List Biopac EDA CSV files.
const biopacEDAFiles = [
  "Data_sets/Biopac_data/EDA/Subject3F_EDA.csv",
  "Data_sets/Biopac_data/EDA/Subject4F_EDA.csv",
  "Data_sets/Biopac_data/EDA/Subject6M_EDA.csv",
  "Data_sets/Biopac_data/EDA/Subject8M_EDA.csv",
  "Data_sets/Biopac_data/EDA/Subject11F_EDA.csv",
];

// List Biopac ECG CSV files.
const biopacECGFiles = [
  "Data_sets/Biopac_data/ECG/Subject3F_ECG.csv",
  "Data_sets/Biopac_data/ECG/Subject4F_ECG.csv",
  "Data_sets/Biopac_data/ECG/Subject6M_ECG.csv",
  "Data_sets/Biopac_data/ECG/Subject8M_ECG.csv",
  "Data_sets/Biopac_data/ECG/Subject11F_ECG.csv",
];

const rawSampleRate = 2000; // Raw sample rate in Hz
const downsampleFactor = 1000; // Adjust as needed

function processBiopacFile(file, colName) {
  return d3.text(file).then((text) => {
    let lines = text.split(/\r?\n/).filter((line) => line.trim() !== "");
    const downsampled = lines.filter((_, i) => i % downsampleFactor === 0);
    const result = downsampled.map((line, i) => ({
      time: (i * downsampleFactor) / rawSampleRate,
      value: parseFloat(line),
    }));
    // Extract subject from filename.
    const basename = file.substring(file.lastIndexOf("/") + 1);
    const filenameWithoutExt = basename.replace(".csv", "");
    let subject = "Unknown";
    if (filenameWithoutExt.startsWith("Subject")) {
      const underscoreIndex = filenameWithoutExt.indexOf("_");
      if (underscoreIndex !== -1) {
        subject = filenameWithoutExt
          .substring("Subject".length, underscoreIndex)
          .trim();
      }
    }
    result.forEach((row) => {
      row.subject = subject;
    });
    return result.map((row) => ({
      time: row.time,
      [colName]: row.value,
      subject: row.subject,
    }));
  });
}

function renderBiopacCharts(EDAFiles, ECGFiles) {
  Promise.all(EDAFiles.map((file) => processBiopacFile(file, "EDA")))
    .then((resultsEDA) => {
      const allEDA = resultsEDA.flat();
      window.dataBiopacEDA = allEDA;
      return Promise.all(
        ECGFiles.map((file) => processBiopacFile(file, "ECG"))
      );
    })
    .then((resultsECG) => {
      const allECG = resultsECG.flat();
      window.dataBiopacECG = allECG;
      updateLinkedPhysioCharts();
    })
    .catch((error) => {
      console.error("Error processing Biopac data:", error);
    });
}

document.addEventListener("DOMContentLoaded", () => {
  console.log("Processing behavioral data...");
  const selectedSubject = document.getElementById("subjectSelect");
  console.log("Selected subject:", selectedSubject);
  if (!selectedSubject) {
    console.error("Subject select element not found!");
    return;
  }

  renderBiopacCharts(biopacEDAFiles, biopacECGFiles);

  let edaFile, ecgFile;

  selectedSubject.addEventListener("change", () => {
    const subject = selectedSubject.value;
    console.log("Subject changed to:", subject);
    if (subject === "All") {
      console.log("Showing all subjects.");
      edaFile = biopacEDAFiles;
      ecgFile = biopacECGFiles;
      renderBiopacCharts(edaFile, ecgFile);
    } else {
      console.log(`Showing data for subject: ${subject}`);
      edaFile = biopacEDAFiles.filter((f) =>
        f.includes(`Subject${subject.slice(0, -1)}`)
      );
      ecgFile = biopacECGFiles.filter((f) =>
        f.includes(`Subject${subject.slice(0, -1)}`)
      );
      renderBiopacCharts(edaFile, ecgFile);
    }
  });
});
