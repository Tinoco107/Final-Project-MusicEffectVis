/*
// Global margin configuration for physiological charts.
const physioMargin = { top: 20, right: 20, bottom: 50, left: 60 };


function updateLinkedPhysioCharts(subject) {
  if (!window.dataBiopacEDA || !window.dataBiopacECG) {
      console.error("ERROR: Biopac data is missing. Cannot proceed.");
      return;
  }

  console.log("Attempting to update physiological charts for subject:", subject);
  console.log("Biopac EDA Data:", window.dataBiopacEDA);
  console.log("Biopac ECG Data:", window.dataBiopacECG);

  const dataEDA = window.dataBiopacEDA.filter(d => String(d.subject) === subject);
  const dataECG = window.dataBiopacECG.filter(d => String(d.subject) === subject);

  console.log("Filtered EDA Data:", dataEDA);
  console.log("Filtered ECG Data:", dataECG);

  if (dataEDA.length === 0 || dataECG.length === 0) {
      console.error("ERROR: No physiological data found for subject:", subject);
      return;
  }

  // Ensure each row has a valid time property
  dataEDA.forEach((d, i) => { d.time = d.time != null ? +d.time : i; });
  dataECG.forEach((d, i) => { d.time = d.time != null ? +d.time : i; });

  console.log("EDA Time Values:", dataEDA.map(d => d.time));
  console.log("ECG Time Values:", dataECG.map(d => d.time));

  const edaSvg = d3.select("#edaChart");
  const ecgSvg = d3.select("#ecgChart");
  edaSvg.selectAll("*").remove();
  ecgSvg.selectAll("*").remove();

  const allTimes = dataEDA.concat(dataECG).map(d => d.time);
  console.log("Combined Time Values for xDomain:", allTimes);

  const xDomain = d3.extent(allTimes);
  console.log("Computed xDomain:", xDomain);

  const edaWidth = +edaSvg.attr("width") - physioMargin.left - physioMargin.right;
  const edaHeight = +edaSvg.attr("height") - physioMargin.top - physioMargin.bottom;
  const ecgWidth = +ecgSvg.attr("width") - physioMargin.left - physioMargin.right;
  const ecgHeight = +ecgSvg.attr("height") - physioMargin.top - physioMargin.bottom;

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

  console.log("Y Domain for EDA:", yScaleEDA.domain());
  console.log("Y Domain for ECG:", yScaleECG.domain());

  // If time values are invalid, prevent rendering
  if (xDomain[0] == null || xDomain[1] == null) {
      console.error("ERROR: xDomain contains null values. Cannot render chart.");
      return;
  }

  const edaG = edaSvg.append("g").attr("transform", `translate(${physioMargin.left},${physioMargin.top})`);
  const ecgG = ecgSvg.append("g").attr("transform", `translate(${physioMargin.left},${physioMargin.top})`);

  edaG.append("g").attr("transform", `translate(0, ${edaHeight})`).call(d3.axisBottom(xScaleEDA));
  edaG.append("g").call(d3.axisLeft(yScaleEDA));
  ecgG.append("g").attr("transform", `translate(0, ${ecgHeight})`).call(d3.axisBottom(xScaleECG));
  ecgG.append("g").call(d3.axisLeft(yScaleECG));

  const edaLine = d3.line().x(d => xScaleEDA(d.time)).y(d => yScaleEDA(d.EDA));
  const ecgLine = d3.line().x(d => xScaleECG(d.time)).y(d => yScaleECG(d.ECG));

  edaG.append("path").datum(dataEDA).attr("fill", "none").attr("stroke", "purple").attr("stroke-width", 2).attr("d", edaLine);
  ecgG.append("path").datum(dataECG).attr("fill", "none").attr("stroke", "orange").attr("stroke-width", 2).attr("d", ecgLine);

  console.log("EDA & ECG Lines Rendered Successfully!");
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




// When the global subject drop-down changes, update the behavioral and physiological charts.
d3.select("#subjectSelect").on("change", () => {
  updateResponseDistributions();
  updateLinkedPhysioCharts();
});


updateLinkedPhysioCharts();

*/