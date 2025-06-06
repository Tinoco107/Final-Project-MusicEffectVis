/*function updateResponseDistributions() {
  if (!window.dataBehavioral) return;

  // Clear previous contents.
  d3.select("#calmingHist").selectAll("*").remove();
  d3.select("#vexingHist").selectAll("*").remove();

  // Compute global x domain for Response_Time from all behavioral data.
  const globalExtent = d3.extent(window.dataBehavioral, d => d.Response_Time);

  // Create a temporary scale to compute thresholds.
  const tempX = d3.scaleLinear().domain(globalExtent).nice();
  const globalHistogram = d3.bin()
    .domain(tempX.domain())
    .thresholds(tempX.ticks(20));

  // Compute global max bin count across sessions.
  const calmingDataAll = window.dataBehavioral.filter(d => d.Session === "Calming");
  const vexingDataAll = window.dataBehavioral.filter(d => d.Session === "Vexing");
  
  const binsCalmingAll = globalHistogram(calmingDataAll.map(d => d.Response_Time));
  const binsVexingAll = globalHistogram(vexingDataAll.map(d => d.Response_Time));

  const maxCountCalm = d3.max(binsCalmingAll, d => d.length) || 0;
  const maxCountVex = d3.max(binsVexingAll, d => d.length) || 0;
  
  // Use the overall maximum so that both sessions share the same y scale.
  const globalMaxCount = Math.max(maxCountCalm, maxCountVex);

  // Determine y-scaling factor based on the subject selector.
  // If "All" is selected, use a divisor of 2.5; otherwise, leave it as 1.
  let yDivider = 1;
  const subjectSelect = document.querySelector("#subjectSelect");
  if (subjectSelect && subjectSelect.value.toLowerCase() === "all") {
      yDivider = 2.5;
  }

  // Group data by subject.
  const subjects = Array.from(
    d3.group(window.dataBehavioral, d => d.Subject),
    ([subject, data]) => ({ subject, data })
  );

  // Define common dimensions.
  const width = 250,
        height = 150,
        marginHist = { top: 20, right: 20, bottom: 30, left: 30 };

  subjects.forEach(s => {
    // Filter data for Calming and Vexing separately.
    const calmingData = s.data.filter(d => d.Session === "Calming");
    const vexingData = s.data.filter(d => d.Session === "Vexing");

    // For both histograms, the drawing area dimensions.
    const plotWidth = width - marginHist.left - marginHist.right;
    const plotHeight = height - marginHist.top - marginHist.bottom;

    // Create a local x scale using the global domain.
    const xPlot = d3.scaleLinear()
      .domain(globalExtent)
      .range([0, plotWidth]);

    // Create a common y scale based on the adjusted global maximum.
    const yScale = d3.scaleLinear()
      .domain([0, globalMaxCount / yDivider])
      .range([plotHeight, 0])
      .nice();

    // -------------------------------
    // Histogram for Calming:
    // -------------------------------
    if (calmingData.length > 0) {
      const svgCalm = d3.select("#calmingHist")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .classed("facetSvg", true);
      
      const gCalm = svgCalm.append("g")
        .attr("transform", `translate(${marginHist.left},${marginHist.top})`);

      // Generate bins using the global histogram function.
      const binsCalm = globalHistogram(calmingData.map(d => d.Response_Time));

      // Draw histogram bars.
      gCalm.selectAll("rect")
        .data(binsCalm)
        .join("rect")
        .attr("x", d => xPlot(d.x0) + 1)
        .attr("y", d => yScale(d.length))
        .attr("width", d => Math.max(0, xPlot(d.x1) - xPlot(d.x0) - 1))
        .attr("height", d => plotHeight - yScale(d.length))
        .attr("fill", "steelblue");

      // Add X-axis.
      gCalm.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0,${plotHeight})`)
        .call(d3.axisBottom(xPlot).ticks(5));

      // Add Y-axis.
      gCalm.append("g")
        .attr("class", "y-axis")
        .call(d3.axisLeft(yScale).ticks(5));

      // Chart title.
      svgCalm.append("text")
        .attr("x", width / 2)
        .attr("y", marginHist.top - 5)
        .attr("text-anchor", "middle")
        .attr("class", "chart-title")
        .text(`Subject ${s.subject} Calming Music`);
    }

    // -------------------------------
    // Histogram for Vexing:
    // -------------------------------
    if (vexingData.length > 0) {
      const svgVex = d3.select("#vexingHist")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .classed("facetSvg", true);
      
      const gVex = svgVex.append("g")
        .attr("transform", `translate(${marginHist.left},${marginHist.top})`);

      // Generate bins using the global histogram function.
      const binsVex = globalHistogram(vexingData.map(d => d.Response_Time));

      // Draw histogram bars.
      gVex.selectAll("rect")
        .data(binsVex)
        .join("rect")
        .attr("x", d => xPlot(d.x0) + 1)
        .attr("y", d => yScale(d.length))
        .attr("width", d => Math.max(0, xPlot(d.x1) - xPlot(d.x0) - 1))
        .attr("height", d => plotHeight - yScale(d.length))
        .attr("fill", "tomato");

      // Add X-axis.
      gVex.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0,${plotHeight})`)
        .call(d3.axisBottom(xPlot).ticks(5));

      // Add Y-axis.
      gVex.append("g")
        .attr("class", "y-axis")
        .call(d3.axisLeft(yScale).ticks(5));

      // Chart title.
      svgVex.append("text")
        .attr("x", width / 2)
        .attr("y", marginHist.top - 5)
        .attr("text-anchor", "middle")
        .attr("class", "chart-title")
        .text(`Subject ${s.subject} Vexing Music`);
    }
  });
}"""

// Immediately update the response distributions when behavioral data is ready.


document.addEventListener("DOMContentLoaded", function() {
  // PART 1: Start/Intro Transitions
  const startBtn = document.getElementById("start-button");
  startBtn.addEventListener("click", function() {
    // Transition from Intro to Interactive
    document.getElementById("intro").style.display = "none";
    document.getElementById("interactive").style.display = "block";
  });
  
  const width = 1000;
  const height = 500;
  const margin = { top: 60, right: 20, bottom: 100, left: 60 };

  // Append main SVG to #chart
  const svg = d3.select("#chart")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  const tooltip = d3.select("body")
    .append("div")
    .style("position", "absolute")
    .style("padding", "6px")
    .style("background", "white")
    .style("border", "1px solid #ccc")
    .style("border-radius", "4px")
    .style("pointer-events", "none")
    .style("font-size", "12px")
    .style("display", "none");

  let detailedData = null;

  // Load summary data and initialize main chart
  d3.csv("Data_sets/summary.csv").then(summaryData => {
    summaryData.forEach(d => {
      d.Accuracy = +d.Accuracy_Rate;
      d.Response_Time = +d.Avg_Response_Time;
    });

    const subjects = [...new Set(summaryData.map(d => d.Subject))];
    const color = d3.scaleOrdinal()
      .domain(subjects)
      .range(d3.schemeCategory10);

    const x = d3.scaleLinear().domain([240, 440]).range([margin.left, width / 2 - 30]);
    const x2 = d3.scaleLinear().domain([240, 440]).range([width / 2 + 30, width - margin.right]);
    const y = d3.scaleLinear().domain([0.6, 0.8]).range([height - margin.bottom, margin.top]);
    const medianX = d3.median(summaryData, d => d.Response_Time);

    const calming = summaryData.filter(d => d.Session === "Calming");
    const vexing = summaryData.filter(d => d.Session === "Vexing");

    function drawPoints(points, scaleX, sessionClass) {
      svg.selectAll(`.dot-${sessionClass}`)
        .data(points)
        .join("circle")
        .attr("class", d => `dot-${sessionClass} dot ${d.Subject}`)
        .attr("cx", d => scaleX(d.Response_Time))
        .attr("cy", d => y(d.Accuracy))
        .attr("r", 6)
        .attr("fill", d => color(d.Subject))
        .on("mouseover", (event, d) => {
          tooltip.style("display", "block")
            .html(`<strong>${d.Subject}</strong><br/>Accuracy: ${d.Accuracy.toFixed(3)}<br/>Response Time: ${d.Response_Time.toFixed(0)}ms`);
        })
        .on("mousemove", (event) => {
          tooltip.style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", () => {
          tooltip.style("display", "none");
        });
    }

    // Axes for main chart
    svg.append("g")
      .attr("transform", `translate(0, ${height - margin.bottom})`)
      .call(d3.axisBottom(x));
    svg.append("g")
      .attr("transform", `translate(${margin.left}, 0)`)
      .call(d3.axisLeft(y));
    svg.append("g")
      .attr("transform", `translate(0, ${height - margin.bottom})`)
      .call(d3.axisBottom(x2));
    svg.append("g")
      .attr("transform", `translate(${width / 2 + 30}, 0)`)
      .call(d3.axisLeft(y));

    svg.append("text")
      .attr("x", width / 2)
      .attr("y", height - 40)
      .attr("text-anchor", "middle")
      .style("font-weight", "bold")
      .text("Average Response Time (ms)");

    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2)
      .attr("y", 20)
      .attr("text-anchor", "middle")
      .style("font-weight", "bold")
      .text("Accuracy Rate");

    svg.append("text")
      .attr("x", (margin.left + width / 2 - 30) / 2)
      .attr("y", margin.top - 25)
      .attr("text-anchor", "middle")
      .text("Calming Music");

    svg.append("text")
      .attr("x", (width / 2 + width - margin.right) / 2)
      .attr("y", margin.top - 25)
      .attr("text-anchor", "middle")
      .text("Vexing Music");

    [x, x2].forEach(scale => {
      svg.append("line")
        .attr("x1", scale(medianX))
        .attr("x2", scale(medianX))
        .attr("y1", y(0.6))
        .attr("y2", y(0.8))
        .attr("stroke", "gray")
        .attr("stroke-dasharray", "4");

      svg.append("line")
        .attr("x1", scale.range()[0])
        .attr("x2", scale.range()[1])
        .attr("y1", y(0.7))
        .attr("y2", y(0.7))
        .attr("stroke", "gray")
        .attr("stroke-dasharray", "4");
    });

    drawPoints(calming, x, "calming");
    drawPoints(vexing, x2, "vexing");

    const legend = d3.select("#chart-container")
      .insert("div", ":first-child")  // Moves legend to the top
      .attr("class", "legend")
      .style("display", "flex")
      .style("justify-content", "center")
      .style("gap", "12px")
      .style("margin-bottom", "20px");

    let selectedSubject = null;
    subjects.forEach(subject => {
      legend.append("div")
          .style("cursor", "pointer")
          .style("color", color(subject))
          .style("font-weight", "bold")
          .text(subject)
          .on("click", () => {
              if (selectedSubject === subject) {
                  d3.selectAll("circle").attr("opacity", 0.7);
                  selectedSubject = null;
                  d3.select("#detail-plot").html(""); // Clear detailed plot
                  d3.select("#scrolly").style("display", "none"); // Hide scrolly section
              } else {
                  d3.selectAll("circle").attr("opacity", 0.1);
                  d3.selectAll(`circle.${subject}`).attr("opacity", 1.0);
                  selectedSubject = subject;
                  d3.select("#scrolly").style("display", "flex"); // Show scrolly section
                  d3.select("#physioSection").style("display", "flex")
                  drawDetailPlot(subject);
                  updateLinkedPhysioCharts(subject); // Load visualization & text dynamically
              }
          });
  });
  

    d3.csv("Data_sets/data.csv").then(d => {
      d.forEach(row => {
        row.Accuracy = +row.accuracy;
        row.Response_Time = +row.avg_rt;
        row.TrialNumber = +row.TrialNumber;
      });
      detailedData = d;
    });

    // Detailed plot with toggle, tooltip for exact trial stats, and Scrollama integration
    function drawDetailPlot(subject) {
      d3.select("#detail-plot").html(""); // Clear previous content
      d3.select("#scrolly").style("display", "flex"); // Show scrolly section only when a subject is selected
  
      // Ensure the detailed plot section is properly populated
      d3.select("#detail-plot").append("div").attr("id", "detail-graph");
  
      // Create toggle controls above the detailed SVG
      const toggle = d3.select("#detail-plot")
          .append("div")
          .attr("class", "toggle-buttons")
          .style("text-align", "center")
          .style("margin-bottom", "10px");
  
      toggle.append("button")
          .attr("id", "toggle-calming")
          .style("margin-right", "5px")
          .text("Calming")
          .on("click", () => {
              updateDetailPlot(subject, "Calming"); // Pass subject explicitly
              d3.selectAll(".toggle-buttons button").style("font-weight", "normal");
              d3.select("#toggle-calming").style("font-weight", "bold");
          });
  
      toggle.append("button")
          .attr("id", "toggle-vexing")
          .text("Vexing")
          .on("click", () => {
              updateDetailPlot(subject, "Vexing"); // Pass subject explicitly
              d3.selectAll(".toggle-buttons button").style("font-weight", "normal");
              d3.select("#toggle-vexing").style("font-weight", "bold");
          });
  
      d3.select("#toggle-calming").style("font-weight", "bold");
  
      // Ensure the first visualization appears when subject is selected
      updateDetailPlot(subject, "Calming");
      updateLinkedPhysioCharts(subject);
  
      // Subject-Specific Text Updates
      const subjectDescriptions = {
          Subject11: [
              "Step 1: Subject 11 shows rapid response times with high accuracy under calming music.",
              "Step 2: Under vexing conditions, response times slow and accuracy slightly drops."
          ],
          Subject3: [
              "Step 1: Subject 3 maintains steady accuracy, with moderate response speeds under calming music.",
              "Step 2: When exposed to vexing music, response variability increases significantly."
          ],
          Subject8: [
              "Step 1: Subject 8 performs inconsistently across trials, fluctuating in both accuracy and speed.",
              "Step 2: Vexing music amplifies inconsistencies, suggesting cognitive strain."
          ],
          Subject4: [
              "Step 1: Subject 4 exhibits quick reaction times, excelling under calming music.",
              "Step 2: Performance remains stable under vexing conditions, but stress markers increase."
          ],
          Subject6: [
              "Step 1: Subject 6 demonstrates slower yet highly accurate responses under calming music.",
              "Step 2: Accuracy declines under vexing music, while response speed remains steady."
          ]
      };
  
      const textUpdates = subjectDescriptions[subject] || [
          "default"
      ];
  
      // Clear previous scrolling text and update dynamically
      d3.select("#scrolly-text").html("");
      d3.select("#scrolly-text").selectAll(".step")
          .data(textUpdates)
          .join("div")
          .attr("class", "step")
          .text(d => d);
  
      // Reinitialize Scrollama after updating content
      initScrollama();
  }
  
  // **Ensure updateDetailPlot is properly defined BEFORE calling it in drawDetailPlot**
  function updateDetailPlot(subject, session) {
  d3.select("#detail-graph").html(""); // Clear previous visualization

  const detailMargin = { top: 40, right: 60, bottom: 40, left: 60 };
  const detailWidth = 600;  // Adjusted for smaller graph
  const detailHeight = 350;
  const detailSvg = d3.select("#detail-graph")
      .append("svg")
      .attr("width", detailWidth)
      .attr("height", detailHeight);

  // RECREATE TOOLTIP EACH TIME THE GRAPH IS REDRAWN
  const detailTooltip = d3.select("body")
      .selectAll(".detail-tooltip")
      .data([null])
      .join("div")
      .attr("class", "detail-tooltip")
      .style("position", "absolute")
      .style("padding", "6px")
      .style("background", "white")
      .style("border", "1px solid #ccc")
      .style("border-radius", "4px")
      .style("pointer-events", "none")
      .style("font-size", "12px")
      .style("display", "none");

  const data = detailedData.filter(d => d.Subject === subject && d.Session === session);
  const trials = [...new Set(data.map(d => d.TrialNumber))];

  // Load both Calming and Vexing data for tooltips
  const calmingData = detailedData.filter(d => d.Subject === subject && d.Session === "Calming");
  const vexingData = detailedData.filter(d => d.Subject === subject && d.Session === "Vexing");

  const xScale = d3.scaleBand()
      .domain(trials)
      .range([detailMargin.left, detailWidth - detailMargin.right])
      .padding(0.1);

  const yLeft = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.Response_Time)]).nice()
      .range([detailHeight - detailMargin.bottom, detailMargin.top]);

  const yRight = d3.scaleLinear()
      .domain([0, 1])
      .range([detailHeight - detailMargin.bottom, detailMargin.top]);

  // DRAW AXES
  detailSvg.append("g")
      .attr("transform", `translate(0,${detailHeight - detailMargin.bottom})`)
      .call(d3.axisBottom(xScale).tickValues(trials.filter(t => t % 2 === 0)));

  detailSvg.append("g")
      .attr("transform", `translate(${detailMargin.left},0)`)
      .call(d3.axisLeft(yLeft));

  detailSvg.append("g")
      .attr("transform", `translate(${detailWidth - detailMargin.right},0)`)
      .call(d3.axisRight(yRight));

  // ADD TITLES
  detailSvg.append("text")
      .attr("x", detailMargin.left - 40)
      .attr("y", detailMargin.top - 10)
      .text("Response Time (ms)")
      .attr("font-size", "12px");

  detailSvg.append("text")
      .attr("x", detailWidth - detailMargin.right + 10)
      .attr("y", detailMargin.top - 10)
      .text("Accuracy Rate")
      .attr("font-size", "12px");

  detailSvg.append("text")
      .attr("x", detailWidth / 2)
      .attr("y", 20)
      .attr("text-anchor", "middle")
      .attr("font-size", "16px")
      .text(`Per-Trial Performance of ${subject} (${session})`);

  // Bars (Response Time)
  detailSvg.selectAll(".bar")
      .data(data)
      .join("rect")
      .attr("class", "bar")
      .attr("x", d => xScale(d.TrialNumber))
      .attr("y", d => yLeft(d.Response_Time))
      .attr("height", d => yLeft(0) - yLeft(d.Response_Time))
      .attr("width", xScale.bandwidth())
      .attr("fill", session === "Calming" ? "#4B9CD3" : "#D94E5D")
      .attr("opacity", 0.6)
      .on("mouseover", function (event, d) {
          // Find corresponding data from both sessions
          const calmTrial = calmingData.find(cd => cd.TrialNumber === d.TrialNumber);
          const vexTrial = vexingData.find(vd => vd.TrialNumber === d.TrialNumber);

          detailTooltip.style("display", "block")
              .html(
                  `<strong>Trial: ${d.TrialNumber}</strong><br/>
                  Response Time Calming: ${calmTrial ? calmTrial.Response_Time.toFixed(0) + 'ms' : 'N/A'}<br/>
                  Response Time Vexing: ${vexTrial ? vexTrial.Response_Time.toFixed(0) + 'ms' : 'N/A'}<br/>
                  Accuracy Calming: ${calmTrial ? calmTrial.Accuracy.toFixed(3) : 'N/A'}<br/>
                  Accuracy Vexing: ${vexTrial ? vexTrial.Accuracy.toFixed(3) : 'N/A'}`
              );
      })
      .on("mousemove", function (event) {
          detailTooltip.style("left", (event.pageX + 10) + "px")
              .style("top", (event.pageY - 28) + "px");
      })
      .on("mouseout", function () {
          detailTooltip.style("display", "none");
      });

  // Line (Accuracy)
  const line = d3.line()
      .x(d => xScale(d.TrialNumber) + xScale.bandwidth() / 2)
      .y(d => yRight(d.Accuracy));

  detailSvg.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", session === "Calming" ? "#08519c" : "#a50f15")
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", session === "Calming" ? "0" : "4,2")
      .attr("d", line);
}

// Make sure physioMargin is defined
const physioMargin = { top: 20, right: 20, bottom: 50, left: 60 };

function updateLinkedPhysioCharts(subject) {
  if (!window.dataBiopacEDA || !window.dataBiopacECG) {
    setTimeout(() => updateLinkedPhysioCharts(subject), 200);
    console.error("ERROR: Physiological data is missing.");
    
    return;
  }
  if (!subject) {
    console.error("ERROR: Subject not provided!");
    return;
  }
  console.log("Updating physiological charts for: " + subject);
  
  // Filter physiological data and include only rows with valid numbers.
  var dataEDA = window.dataBiopacEDA.filter(function(d) {
    return String(d.subject).trim() === String(subject).trim() && typeof d.EDA === "number";
  }).filter(function(d) {
    return !isNaN(d.EDA);
  });
  
  var dataECG = window.dataBiopacECG.filter(function(d) {
    return String(d.subject).trim() === String(subject).trim() && typeof d.ECG === "number";
  }).filter(function(d) {
    return !isNaN(d.ECG);
  });
  
  console.log("Filtered EDA Data:", dataEDA);
  console.log("Filtered ECG Data:", dataECG);
  if (dataEDA.length === 0 || dataECG.length === 0) {
    console.error("ERROR: No physiological data found for subject: " + subject);
    return;
  }
  
  var edaSvg = d3.select("#edaChart");
  var ecgSvg = d3.select("#ecgChart");
  
  console.log("Checking EDA SVG:", edaSvg.size());
  console.log("Checking ECG SVG:", ecgSvg.size());
  
  edaSvg.selectAll("*").remove();
  ecgSvg.selectAll("*").remove();
  
  var physioWidth = Math.min(window.innerWidth - 50, 1200), physioHeight = 300;
  var edaG = edaSvg.append("g")
    .attr("transform", "translate(" + physioMargin.left + "," + physioMargin.top + ")");
  var ecgG = ecgSvg.append("g")
    .attr("transform", "translate(" + physioMargin.left + "," + physioMargin.top + ")");
  
  console.log("EDA Min/Max:", d3.min(dataEDA, function(d) { return d.EDA; }), d3.max(dataEDA, function(d) { return d.EDA; }));
  console.log("ECG Min/Max:", d3.min(dataECG, function(d) { return d.ECG; }), d3.max(dataECG, function(d) { return d.ECG; }));
  
  var xDomain = d3.extent(dataEDA.concat(dataECG), function(d) { return d.time; });
  var xScaleEDA = d3.scaleLinear().domain(xDomain).range([0, physioWidth - physioMargin.right]).nice();
  var xScaleECG = d3.scaleLinear().domain(xDomain).range([0, physioWidth - physioMargin.right]).nice();
  
  var yScaleEDA = d3.scaleLinear()
    .domain([d3.min(dataEDA, function(d) { return d.EDA; }) || 0, d3.max(dataEDA, function(d) { return d.EDA; }) || 1])
    .range([physioHeight - physioMargin.bottom, 0]).nice();
  
  var yScaleECG = d3.scaleLinear()
    .domain([d3.min(dataECG, function(d) { return d.ECG; }) || 0, d3.max(dataECG, function(d) { return d.ECG; }) || 1])
    .range([physioHeight - physioMargin.bottom, 0]).nice();
  
  edaG.append("g")
    .attr("transform", "translate(0," + (physioHeight - physioMargin.bottom) + ")")
    .call(d3.axisBottom(xScaleEDA));
  edaG.append("g")
    .call(d3.axisLeft(yScaleEDA));
  ecgG.append("g")
    .attr("transform", "translate(0," + (physioHeight - physioMargin.bottom) + ")")
    .call(d3.axisBottom(xScaleECG));
  ecgG.append("g")
    .call(d3.axisLeft(yScaleECG));
  
  var edaLine = d3.line()
    .x(function(d) { return xScaleEDA(d.time); })
    .y(function(d) { return yScaleEDA(d.EDA); });
  var ecgLine = d3.line()
    .x(function(d) { return xScaleECG(d.time); })
    .y(function(d) { return yScaleECG(d.ECG); });
  
  edaG.append("path")
    .datum(dataEDA)
    .attr("fill", "none")
    .attr("stroke", "purple")
    .attr("stroke-width", 2)
    .attr("d", edaLine);
  
  ecgG.append("path")
    .datum(dataECG)
    .attr("fill", "none")
    .attr("stroke", "orange")
    .attr("stroke-width", 2)
    .attr("d", ecgLine);
  
  console.log("EDA & ECG Lines Rendered Successfully");
  d3.select("#physioSection")
    .style("display", "flex")
    .style("visibility", "visible")
    .style("opacity", 1);
}



  
  
    // Initialize Scrollama on the steps inside the scrolly-text container.
    function initScrollama() {
      const scroller = scrollama();
      scroller.setup({
        step: ".step",
        offset: 0.5,
        debug: false
      })
      .onStepEnter(handleStepEnter)
      .onStepExit(handleStepExit);
    }
    
    function handleStepEnter(response) {
      // Highlight the text step that is in view.
      d3.select(response.element).classed("is-active", true);
      console.log("Entering step", response.index);
      // You can add additional logic here to update the graphic on the left.
    }
    
    function handleStepExit(response) {
      d3.select(response.element).classed("is-active", false);
      console.log("Exiting step", response.index);
    }
  });
});
*/
// Declare globally so that all functions can access detailedData.
let detailedData = [];

  function drawMainCharts() {
    const width = 1000;
    const height = 500;
    const margin = { top: 60, right: 20, bottom: 100, left: 60 };

    const svg = d3.select("#chart")
      .append("svg")
      .attr("width", width)
      .attr("height", height);

    const tooltip = d3.select("body")
      .append("div")
      .style("position", "absolute")
      .style("padding", "6px")
      .style("background", "white")
      .style("border", "1px solid #ccc")
      .style("border-radius", "4px")
      .style("pointer-events", "none")
      .style("font-size", "12px")
      .style("display", "none");

    d3.csv("Data_sets/summary.csv").then(summaryData => {
      summaryData.forEach(d => {
        d.Accuracy = +d.Accuracy_Rate;
        d.Response_Time = +d.Avg_Response_Time;
      });

      const subjects = [...new Set(summaryData.map(d => d.Subject))];
      const color = d3.scaleOrdinal().domain(subjects).range(d3.schemeCategory10);
      const x = d3.scaleLinear().domain([240, 440]).range([margin.left, width / 2 - 30]);
      const x2 = d3.scaleLinear().domain([240, 440]).range([width / 2 + 30, width - margin.right]);
      const y = d3.scaleLinear().domain([0.6, 0.8]).range([height - margin.bottom, margin.top]);
      const medianX = d3.median(summaryData, d => d.Response_Time);
      const calming = summaryData.filter(d => d.Session === "Calming");
      const vexing = summaryData.filter(d => d.Session === "Vexing");

      function drawPoints(points, scaleX, sessionClass) {
        svg.selectAll(`.dot-${sessionClass}`)
          .data(points)
          .join("circle")
          .attr("class", d => `dot-${sessionClass} dot ${d.Subject}`)
          .attr("cx", d => scaleX(d.Response_Time))
          .attr("cy", d => y(d.Accuracy))
          .attr("r", 6)
          .attr("fill", d => color(d.Subject))
          .on("mouseover", (event, d) => {
            tooltip.style("display", "block")
              .html(`<strong>${d.Subject}</strong><br/>Accuracy: ${d.Accuracy.toFixed(3)}<br/>Response Time: ${d.Response_Time.toFixed(0)}ms`);
          })
          .on("mousemove", (event) => {
            tooltip.style("left", (event.pageX + 10) + "px")
                  .style("top", (event.pageY - 28) + "px");
          })
          .on("mouseout", () => tooltip.style("display", "none"));
      }

      svg.append("g").attr("transform", `translate(0, ${height - margin.bottom})`).call(d3.axisBottom(x));
      svg.append("g").attr("transform", `translate(${margin.left}, 0)`).call(d3.axisLeft(y));
      svg.append("g").attr("transform", `translate(0, ${height - margin.bottom})`).call(d3.axisBottom(x2));
      svg.append("g").attr("transform", `translate(${width / 2 + 30}, 0)`).call(d3.axisLeft(y));

      svg.append("text").attr("x", width / 2).attr("y", height - 40).attr("text-anchor", "middle").style("font-weight", "bold").text("Average Response Time (ms)");
      svg.append("text").attr("transform", "rotate(-90)").attr("x", -height / 2).attr("y", 20).attr("text-anchor", "middle").style("font-weight", "bold").text("Accuracy Rate");
      svg.append("text").attr("x", (margin.left + width / 2 - 30) / 2).attr("y", margin.top - 25).attr("text-anchor", "middle").text("Calming Music");
      svg.append("text").attr("x", (width / 2 + width - margin.right) / 2).attr("y", margin.top - 25).attr("text-anchor", "middle").text("Vexing Music");

      [x, x2].forEach(scale => {
        svg.append("line").attr("x1", scale(medianX)).attr("x2", scale(medianX)).attr("y1", y(0.6)).attr("y2", y(0.8)).attr("stroke", "gray").attr("stroke-dasharray", "4");
        svg.append("line").attr("x1", scale.range()[0]).attr("x2", scale.range()[1]).attr("y1", y(0.7)).attr("y2", y(0.7)).attr("stroke", "gray").attr("stroke-dasharray", "4");
      });

      drawPoints(calming, x, "calming");
      drawPoints(vexing, x2, "vexing");

      const legend = d3.select("#chart-container").insert("div", ":first-child")
        .attr("class", "legend")
        .style("display", "flex")
        .style("justify-content", "center")
        .style("gap", "12px")
        .style("margin-bottom", "20px");

      let selectedSubject = null;
      subjects.forEach(subject => {
        legend.append("div")
          .style("cursor", "pointer")
          .style("color", color(subject))
          .style("font-weight", "bold")
          .text(subject)
          .on("click", () => {
            if (selectedSubject === subject) {
              d3.selectAll("circle").attr("opacity", 0.7);
              selectedSubject = null;
              d3.select("#detail-plot").html("");
              d3.select("#detailed-plot-section").style("display", "none");
              d3.select("#physio-plot-section").style("display", "none");
            } else {
              d3.selectAll("circle").attr("opacity", 0.1);
              d3.selectAll(`circle.${subject}`).attr("opacity", 1.0);
              selectedSubject = subject;
              d3.select("#detailed-plot-section").style("display", "block");
              d3.select("#physio-plot-section").style("display", "block");
              drawDetailPlot(subject);
              updateLinkedPhysioCharts(subject);
            }
          });
      });
    });

    d3.csv("Data_sets/data.csv").then(d => {
      d.forEach(row => {
        row.Accuracy = +row.accuracy;
        row.Response_Time = +row.avg_rt;
        row.TrialNumber = +row.TrialNumber;
      });
      detailedData = d;
    });
  }


  /***********************
   * PART 3: Detail Plot & Physiological Charts Functions
   ***********************/

  function drawDetailPlot(subject) {

    // Clear the detailed plot container in Section 1.
    d3.select("#detail-plot").html("");
    
    // Ensure that a container for the detailed graph exists.
    if (d3.select("#detail-graph").empty()) {
      d3.select("#detail-plot").append("div").attr("id", "detail-graph");
    }
    
    // Create toggle controls for session selection (Calming vs. Vexing).
    const toggle = d3.select("#detail-plot")
      .append("div")
      .attr("class", "toggle-buttons")
      .style("text-align", "center")
      .style("margin-bottom", "10px");
    
    toggle.append("button")
      .attr("id", "toggle-calming")
      .style("margin-right", "5px")
      .text("Calming")
      .on("click", () => {
        updateDetailPlot(subject, "Calming");
        d3.selectAll(".toggle-buttons button").style("font-weight", "normal");
        d3.select("#toggle-calming").style("font-weight", "bold");
      });
    
    toggle.append("button")
      .attr("id", "toggle-vexing")
      .text("Vexing")
      .on("click", () => {
        updateDetailPlot(subject, "Vexing");
        d3.selectAll(".toggle-buttons button").style("font-weight", "normal");
        d3.select("#toggle-vexing").style("font-weight", "bold");
      });
    
    // Set the default session to Calming.
    d3.select("#toggle-calming").style("font-weight", "bold");
    updateDetailPlot(subject, "Calming");
    
    // Update the physiological charts for this subject (Section 2).
    updateLinkedPhysioCharts(subject);
    
    // Update the subject insights on the right side.
    const subjectDescriptions = {
      Subject11: "Subject 11 detailed insight text for plot.",
      Subject3: "Subject 3 detailed insight text for plot.",
      Subject8: "Subject 8 detailed insight text for plot.",
      Subject4: "Subject 4 detailed insight text for plot.",
      Subject6: "Subject 6 detailed insight text for plot."
    };
    const detailText = subjectDescriptions[subject] || "Default detailed insight for plot.";
    d3.select("#detailed-insight-text").text(detailText);
  }
  
  function updateDetailPlot(subject, session) {
    // Clear the existing detailed graph.
    d3.select("#detail-graph").html("");
    
    // Dimensions for the detailed plot.
    const detailMargin = { top: 40, right: 60, bottom: 40, left: 60 };
    const detailWidth = 600;
    const detailHeight = 350;
    
    // Append an SVG for the detailed plot.
    const detailSvg = d3.select("#detail-graph")
      .append("svg")
      .attr("width", detailWidth)
      .attr("height", detailHeight);
    
    // Create (or update) the tooltip.
    const detailTooltip = d3.select("body")
      .selectAll(".detail-tooltip")
      .data([null])
      .join("div")
      .attr("class", "detail-tooltip")
      .style("position", "absolute")
      .style("padding", "6px")
      .style("background", "white")
      .style("border", "1px solid #ccc")
      .style("border-radius", "4px")
      .style("pointer-events", "none")
      .style("font-size", "12px")
      .style("display", "none");
    
    // Filter the detailedData based on subject and session.
    const data = detailedData.filter(d => d.Subject === subject && d.Session === session);
    if (data.length === 0) {
      console.warn(`No detailed data available for ${subject} (${session})`);
      return;
    }
    const trials = [...new Set(data.map(d => d.TrialNumber))];
    
    // Also filter data for both sessions (for tooltip comparisons).
    const calmingData = detailedData.filter(d => d.Subject === subject && d.Session === "Calming");
    const vexingData = detailedData.filter(d => d.Subject === subject && d.Session === "Vexing");
    
    // Setup scales.
    const xScale = d3.scaleBand()
      .domain(trials)
      .range([detailMargin.left, detailWidth - detailMargin.right])
      .padding(0.1);
    
    const yLeft = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.Response_Time)]).nice()
      .range([detailHeight - detailMargin.bottom, detailMargin.top]);
    
    const yRight = d3.scaleLinear()
      .domain([0, 1])
      .range([detailHeight - detailMargin.bottom, detailMargin.top]);
    
    // Draw axes.
    detailSvg.append("g")
      .attr("transform", `translate(0,${detailHeight - detailMargin.bottom})`)
      .call(d3.axisBottom(xScale).tickValues(trials.filter(t => t % 2 === 0)));
    
    detailSvg.append("g")
      .attr("transform", `translate(${detailMargin.left},0)`)
      .call(d3.axisLeft(yLeft));
    
    detailSvg.append("g")
      .attr("transform", `translate(${detailWidth - detailMargin.right},0)`)
      .call(d3.axisRight(yRight));
    
    // Add axis labels and title.
    detailSvg.append("text")
      .attr("x", detailMargin.left - 40)
      .attr("y", detailMargin.top - 10)
      .text("Response Time (ms)")
      .attr("font-size", "12px");
    
    detailSvg.append("text")
      .attr("x", detailWidth - detailMargin.right + 10)
      .attr("y", detailMargin.top - 10)
      .text("Accuracy Rate")
      .attr("font-size", "12px");
    
    detailSvg.append("text")
      .attr("x", detailWidth / 2)
      .attr("y", 20)
      .attr("text-anchor", "middle")
      .attr("font-size", "16px")
      .text(`Per-Trial Performance of ${subject} (${session})`);
    
    // Draw bars representing Response Time.
    detailSvg.selectAll(".bar")
      .data(data)
      .join("rect")
      .attr("class", "bar")
      .attr("x", d => xScale(d.TrialNumber))
      .attr("y", d => yLeft(d.Response_Time))
      .attr("height", d => yLeft(0) - yLeft(d.Response_Time))
      .attr("width", xScale.bandwidth())
      .attr("fill", session === "Calming" ? "#4B9CD3" : "#D94E5D")
      .attr("opacity", 0.6)
      .on("mouseover", function(event, d) {
        const calmTrial = calmingData.find(cd => cd.TrialNumber === d.TrialNumber);
        const vexTrial = vexingData.find(vd => vd.TrialNumber === d.TrialNumber);
        detailTooltip.style("display", "block")
          .html(`<strong>Trial: ${d.TrialNumber}</strong><br/>
                 Response Time Calming: ${calmTrial ? calmTrial.Response_Time.toFixed(0) + 'ms' : 'N/A'}<br/>
                 Response Time Vexing: ${vexTrial ? vexTrial.Response_Time.toFixed(0) + 'ms' : 'N/A'}<br/>
                 Accuracy Calming: ${calmTrial ? calmTrial.Accuracy.toFixed(3) : 'N/A'}<br/>
                 Accuracy Vexing: ${vexTrial ? vexTrial.Accuracy.toFixed(3) : 'N/A'}`);
      })
      .on("mousemove", function(event) {
        detailTooltip.style("left", (event.pageX + 10) + "px")
                     .style("top", (event.pageY - 28) + "px");
      })
      .on("mouseout", function() {
        detailTooltip.style("display", "none");
      });
    
    // Draw a line for Accuracy.
    const line = d3.line()
      .x(d => xScale(d.TrialNumber) + xScale.bandwidth() / 2)
      .y(d => yRight(d.Accuracy));
    
    detailSvg.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", session === "Calming" ? "#08519c" : "#a50f15")
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", session === "Calming" ? "0" : "4,2")
      .attr("d", line);
  }  
  function updateLinkedPhysioCharts(subject) {
    const physioMargin = { top: 20, right: 20, bottom: 50, left: 60 };
  

    if (!window.dataBiopacEDA || !window.dataBiopacECG) {
      console.error("ERROR: Biopac data is missing. Retrying...");
      setTimeout(() => updateLinkedPhysioCharts(subject), 200);
      return;
    }
    
    if (!subject) {
      console.error("ERROR: Subject not provided to updateLinkedPhysioCharts.");
      return;
    }
    
    console.log("Updating physiological charts for subject:", subject);
    
    // Normalize subject name.
    subject = String(subject).trim().toLowerCase();
    
    const dataEDA = window.dataBiopacEDA.filter(d => String(d.subject).trim().toLowerCase() === subject);
    const dataECG = window.dataBiopacECG.filter(d => String(d.subject).trim().toLowerCase() === subject);
    
    console.log("Filtered EDA Data:", dataEDA);
    console.log("Filtered ECG Data:", dataECG);
    
    if (dataEDA.length === 0 || dataECG.length === 0) {
      console.error("ERROR: No physiological data found for subject:", subject);
      return;
    }
    
    // Ensure time values exist: assign synthetic index if missing.
    dataEDA.forEach((d, i) => { d.time = (d.time !== undefined && d.time !== null) ? +d.time : i; });
    dataECG.forEach((d, i) => { d.time = (d.time !== undefined && d.time !== null) ? +d.time : i; });
    
    const edaSvg = d3.select("#edaChart");
    const ecgSvg = d3.select("#ecgChart");
    edaSvg.selectAll("*").remove();
    ecgSvg.selectAll("*").remove();
    
    const edaWidth = +edaSvg.attr("width") - physioMargin.left - physioMargin.right;
    const edaHeight = +edaSvg.attr("height") - physioMargin.top - physioMargin.bottom;
    const ecgWidth = +ecgSvg.attr("width") - physioMargin.left - physioMargin.right;
    const ecgHeight = +ecgSvg.attr("height") - physioMargin.top - physioMargin.bottom;
    
    const edaG = edaSvg.append("g").attr("transform", `translate(${physioMargin.left},${physioMargin.top})`);
    const ecgG = ecgSvg.append("g").attr("transform", `translate(${physioMargin.left},${physioMargin.top})`);
    
    // Compute the x-domain.
    const allTimes = dataEDA.concat(dataECG).map(d => d.time);
    const xDomain = d3.extent(allTimes);
    if (xDomain[0] == null || xDomain[1] == null) {
      console.error("ERROR: xDomain contains null values. Cannot render chart.");
      return;
    }
    
    const xScaleEDA = d3.scaleLinear().domain(xDomain).range([0, edaWidth]).nice();
    const xScaleECG = d3.scaleLinear().domain(xDomain).range([0, ecgWidth]).nice();
    
    const yScaleEDA = d3.scaleLinear()
        .domain([d3.min(dataEDA, d => d.EDA), d3.max(dataEDA, d => d.EDA)])
        .range([edaHeight, 0])
        .nice();
    const yScaleECG = d3.scaleLinear()
        .domain([d3.min(dataECG, d => d.ECG), d3.max(dataECG, d => d.ECG)])
        .range([ecgHeight, 0])
        .nice();
    
    edaG.append("g").attr("transform", `translate(0, ${edaHeight})`).call(d3.axisBottom(xScaleEDA));
    edaG.append("g").call(d3.axisLeft(yScaleEDA));
    ecgG.append("g").attr("transform", `translate(0, ${ecgHeight})`).call(d3.axisBottom(xScaleECG));
    ecgG.append("g").call(d3.axisLeft(yScaleECG));
    
    const edaLine = d3.line().x(d => xScaleEDA(d.time)).y(d => yScaleEDA(d.EDA));
    const ecgLine = d3.line().x(d => xScaleECG(d.time)).y(d => yScaleECG(d.ECG));
    
    edaG.append("path")
        .datum(dataEDA)
        .attr("fill", "none")
        .attr("stroke", "purple")
        .attr("stroke-width", 2)
        .attr("d", edaLine);
    ecgG.append("path")
        .datum(dataECG)
        .attr("fill", "none")
        .attr("stroke", "orange")
        .attr("stroke-width", 2)
        .attr("d", ecgLine);
    
    // Append marker lines for tooltip use.
    const edaMarker = edaG.append("line")
        .attr("stroke", "black")
        .attr("stroke-dasharray", "4,4")
        .attr("y1", 0)
        .attr("y2", edaHeight)
        .style("opacity", 0);
    const ecgMarker = ecgG.append("line")
        .attr("stroke", "black")
        .attr("stroke-dasharray", "4,4")
        .attr("y1", 0)
        .attr("y2", ecgHeight)
        .style("opacity", 0);
    
    const tooltip = d3.select("#tooltip");
    
    edaG.append("rect")
      .attr("class", "overlay")
      .attr("width", edaWidth)
      .attr("height", edaHeight)
      .style("fill", "none")
      .style("pointer-events", "all")
      .on("mousemove", function(event) {
        const [xPos] = d3.pointer(event, this);
        const t = xScaleEDA.invert(xPos);
        updateLinkedTooltip(t, xScaleEDA, xScaleECG, yScaleEDA, yScaleECG, edaMarker, ecgMarker, tooltip, event);
      })
      .on("mouseout", () => {
        tooltip.classed("hidden", true);
        edaMarker.style("opacity", 0);
        ecgMarker.style("opacity", 0);
      });
    
    edaSvg.append("text")
        .attr("x", (edaWidth + physioMargin.left + physioMargin.right) / 2)
        .attr("y", physioMargin.top - 5)
        .attr("text-anchor", "middle")
        .attr("class", "chart-title")
        .text("EDA over Time");
    
    ecgSvg.append("text")
        .attr("x", (ecgWidth + physioMargin.left + physioMargin.right) / 2)
        .attr("y", physioMargin.top - 5)
        .attr("text-anchor", "middle")
        .attr("class", "chart-title")
        .text("ECG over Time");
    
    console.log(" EDA & ECG Lines Rendered Successfully!");
  }
  

  function updateLinkedTooltip(
    time,
    xScaleEDA,
    xScaleECG,
    yScaleEDA,
    yScaleECG,
    edaMarker,
    ecgMarker,
    tooltip,
    event
  ) {
    const bisect = d3.bisector((d) => d.time).left;
    const edaData = window.dataBiopacEDA;
    const i = bisect(edaData, time);
    const d0 = edaData[i - 1];
    const d1 = edaData[i];
    const dEDA = !d0 ? d1 : !d1 ? d0 : time - d0.time > d1.time - time ? d1 : d0;
  
  
    const ecgData = window.dataBiopacECG;
    const j = bisect(ecgData, time);
    const e0 = ecgData[j - 1];
    const e1 = ecgData[j];
    const dECG = !e0 ? e1 : !e1 ? e0 : time - e0.time > e1.time - time ? e1 : e0;
  
  
    edaMarker
      .attr("x1", xScaleEDA(dEDA.time))
      .attr("x2", xScaleEDA(dEDA.time))
      .style("opacity", 1);
  
  
    ecgMarker
      .attr("x1", xScaleECG(dECG.time))
      .attr("x2", xScaleECG(dECG.time))
      .style("opacity", 1);
  
  
    tooltip.html(
      `Time: ${dEDA.time.toFixed(2)} s<br>` +
      `EDA: ${dEDA.EDA.toFixed(2)} μS<br>` +
      `ECG: ${dECG.ECG.toFixed(2)} mV`
    )
    .style("left", (event.pageX + 10) + "px")  // use event.pageX/Y to position tooltip relative to page
    .style("top", (event.pageY - 28) + "px")
    .classed("hidden", false);
  }
  
  window.drawMainCharts = drawMainCharts;

