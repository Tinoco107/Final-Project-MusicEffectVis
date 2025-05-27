// List Biopac EDA CSV files from the Data_sets/Biopac_data/EDA folder.
// Each file corresponds to one individual subject’s data.
const biopacEDAFiles = [
    "Data_sets/Biopac_data/EDA/Subject3F_EDA.csv",
    "Data_sets/Biopac_data/EDA/Subject4F_EDA.csv",
    "Data_sets/Biopac_data/EDA/Subject6M_EDA.csv",
    "Data_sets/Biopac_data/EDA/Subject8M_EDA.csv",
    "Data_sets/Biopac_data/EDA/Subject11F_EDA.csv"
  ];
  
  const rawSampleRate = 2000;    // Raw sampling frequency in Hz
  const downsampleFactor = 1000; // Keep every 1000th sample (adjust as needed)
  
  function processBiopacEDAFile(file) {
    // Read the file as plain text instead of CSV (there's no header in the file).
    return d3.text(file).then(text => {
      let lines = text.split(/\r?\n/).filter(line => line.trim() !== "");
      // Downsample the data.
      const downsampled = lines.filter((_, i) => i % downsampleFactor === 0);
      // Map the downsampled data to objects with computed time:
      const result = downsampled.map((line, i) => ({
        time: (i * downsampleFactor) / rawSampleRate,  // in seconds
        EDA: parseFloat(line)
      }));
      // Extract subject from the filename.
      const basename = file.substring(file.lastIndexOf("/") + 1); // e.g., "Subject3F_EDA.csv"
      const filenameWithoutExt = basename.replace(".csv", "");      // e.g., "Subject3F_EDA"
      // We assume the filename starts with "Subject" followed by the subject ID then an underscore.
      let subject = "Unknown";
      if (filenameWithoutExt.startsWith("Subject")) {
        const underscoreIndex = filenameWithoutExt.indexOf("_");
        if (underscoreIndex !== -1) {
          subject = filenameWithoutExt.substring("Subject".length, underscoreIndex).trim();
        }
      }
      result.forEach(row => { row.subject = subject; });
      return result;
    });
  }
  
  Promise.all(biopacEDAFiles.map(processBiopacEDAFile))
    .then(results => {
      const allBiopacEDA = results.flat();
      window.dataBiopacEDA = allBiopacEDA;
      if (typeof updateBiopacEDA === "function") updateBiopacEDA();
    })
    .catch(error => {
      console.error("Error processing Biopac EDA data:", error);
    });
  