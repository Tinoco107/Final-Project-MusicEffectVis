// List Biopac EDA CSV files.
const biopacEDAFiles = [
  "Data_sets/Biopac_data/EDA/Subject3F_EDA.csv",
  "Data_sets/Biopac_data/EDA/Subject4F_EDA.csv",
  "Data_sets/Biopac_data/EDA/Subject6M_EDA.csv",
  "Data_sets/Biopac_data/EDA/Subject8M_EDA.csv",
  "Data_sets/Biopac_data/EDA/Subject11F_EDA.csv"
];

// List Biopac ECG CSV files.
const biopacECGFiles = [
  "Data_sets/Biopac_data/ECG/Subject3F_ECG.csv",
  "Data_sets/Biopac_data/ECG/Subject4F_ECG.csv",
  "Data_sets/Biopac_data/ECG/Subject6M_ECG.csv",
  "Data_sets/Biopac_data/ECG/Subject8M_ECG.csv",
  "Data_sets/Biopac_data/ECG/Subject11F_ECG.csv"
];

const rawSampleRate = 2000;
const downsampleFactor = 1000;

function processBiopacFile(file, colName) {
  return d3.text(file)
    .then(function(text) {
      console.log("Loaded File:", file);
      console.log("Raw Text Content (First 200 chars):", text.substring(0, 200));
      var lines = text.split(/\r?\n/).filter(function(line) {
        return line.trim() !== "";
      });
      if (lines.length === 0) {
        console.warn("Empty file or failed to load: " + file);
        return [];
      }
      var downsampled = lines.filter(function(_, i) {
        return i % downsampleFactor === 0;
      });
      var result = downsampled.map(function(line, i) {
        var val = parseFloat(line);
        return isNaN(val) ? null : { time: (i * downsampleFactor) / rawSampleRate, value: val };
      }).filter(function(d) { return d !== null; });
      
      var basename = file.substring(file.lastIndexOf("/") + 1);
      var filenameWithoutExt = basename.replace(".csv", "");
      var match = filenameWithoutExt.match(/Subject(\d+)/);
      var subject = match ? "Subject" + match[1] : "Unknown";
      
      result.forEach(function(row) {
        row.subject = subject;
      });
      
      return result.map(function(row) {
        return {
          time: row.time,
          [colName]: row.value,
          subject: row.subject
        };
      });
    })
    .catch(function(error) {
      console.error("Error loading file " + file + ":", error);
      return [];
    });
    
}

function renderBiopacCharts(EDAFiles, ECGFiles) {
  console.log("Loading Biopac Data...");
  Promise.all(EDAFiles.map(function(file) {
      return processBiopacFile(file, "EDA");
    }))
    .then(function(resultsEDA) {
      var allEDA = resultsEDA.flat();
      if (allEDA.length === 0) {
        console.error("EDA Data Failed to Load!");
        return;
      }
      window.dataBiopacEDA = allEDA;
      console.log("Loaded EDA Data:", allEDA);
      return Promise.all(ECGFiles.map(function(file) {
        return processBiopacFile(file, "ECG");
      }));
    })
    .then(function(resultsECG) {
      var allECG = resultsECG.flat();
      if (allECG.length === 0) {
        console.error("ECG Data Failed to Load!");
        return;
      }
      window.dataBiopacECG = allECG;
      console.log("Loaded ECG Data:", allECG);
      if (window.dataBiopacEDA.length > 0 && window.dataBiopacECG.length > 0) {
        updateLinkedPhysioCharts();
      }
    })
    .catch(function(error) {
      console.error(`Error processing Biopac data:`, error);
    });
}

document.addEventListener("DOMContentLoaded", function() {
  console.log("Processing Biopac Data...");
  renderBiopacCharts(biopacEDAFiles, biopacECGFiles);
});


