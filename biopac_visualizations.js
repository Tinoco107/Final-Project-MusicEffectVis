// Global margin configuration for physiological charts.
const physioMargin = { top: 20, right: 20, bottom: 50, left: 60 };

function updateLinkedPhysioCharts() {
  if (!window.dataBiopacEDA || !window.dataBiopacECG) return;

  // Get the selected subject from the global "subjectSelect" drop-down.
  const selectedSubject = d3.select("#subjectSelect").property("value");

  const dataEDA =
    selectedSubject === "All"
      ? window.dataBiopacEDA
      : window.dataBiopacEDA.filter(
          (d) => String(d.subject) === selectedSubject
        );

  const dataECG =
    selectedSubject === "All"
      ? window.dataBiopacECG
      : window.dataBiopacECG.filter(
          (d) => String(d.subject) === selectedSubject
        );

  const edaSvg = d3.select("#edaChart");
  const ecgSvg = d3.select("#ecgChart");
  edaSvg.selectAll("*").remove();
  ecgSvg.selectAll("*").remove();

  const edaWidth =
    +edaSvg.attr("width") - physioMargin.left - physioMargin.right;
  const edaHeight =
    +edaSvg.attr("height") - physioMargin.top - physioMargin.bottom;
  const ecgWidth =
    +ecgSvg.attr("width") - physioMargin.left - physioMargin.right;
  const ecgHeight =
    +ecgSvg.attr("height") - physioMargin.top - physioMargin.bottom;

  const edaG = edaSvg
    .append("g")
    .attr("transform", `translate(${physioMargin.left},${physioMargin.top})`);
  const ecgG = ecgSvg
    .append("g")
    .attr("transform", `translate(${physioMargin.left},${physioMargin.top})`);

  // Use a common time domain.
  const allTimes = dataEDA.concat(dataECG).map((d) => d.time);
  const xDomain = d3.extent(allTimes);

  const xScaleEDA = d3
    .scaleLinear()
    .domain(xDomain)
    .range([0, edaWidth])
    .nice();
  const xScaleECG = d3
    .scaleLinear()
    .domain(xDomain)
    .range([0, ecgWidth])
    .nice();

  const yScaleEDA = d3
    .scaleLinear()
    .domain([d3.min(dataEDA, (d) => d.EDA), d3.max(dataEDA, (d) => d.EDA)])
    .range([edaHeight, 0])
    .nice();
  const yScaleECG = d3
    .scaleLinear()
    .domain([d3.min(dataECG, (d) => d.ECG), d3.max(dataECG, (d) => d.ECG)])
    .range([ecgHeight, 0])
    .nice();

  // Draw axes.
  edaG
    .append("g")
    .attr("transform", `translate(0, ${edaHeight})`)
    .call(d3.axisBottom(xScaleEDA));
  edaG.append("g").call(d3.axisLeft(yScaleEDA));
  ecgG
    .append("g")
    .attr("transform", `translate(0, ${ecgHeight})`)
    .call(d3.axisBottom(xScaleECG));
  ecgG.append("g").call(d3.axisLeft(yScaleECG));

  const edaLine = d3
    .line()
    .x((d) => xScaleEDA(d.time))
    .y((d) => yScaleEDA(d.EDA));
  const ecgLine = d3
    .line()
    .x((d) => xScaleECG(d.time))
    .y((d) => yScaleECG(d.ECG));

  edaG
    .append("path")
    .datum(dataEDA)
    .attr("fill", "none")
    .attr("stroke", "purple")
    .attr("stroke-width", 2)
    .attr("d", edaLine);
  ecgG
    .append("path")
    .datum(dataECG)
    .attr("fill", "none")
    .attr("stroke", "orange")
    .attr("stroke-width", 2)
    .attr("d", ecgLine);

  // Add vertical marker lines.
  const edaMarker = edaG
    .append("line")
    .attr("stroke", "black")
    .attr("stroke-dasharray", "4,4")
    .attr("y1", 0)
    .attr("y2", edaHeight);
  const ecgMarker = ecgG
    .append("line")
    .attr("stroke", "black")
    .attr("stroke-dasharray", "4,4")
    .attr("y1", 0)
    .attr("y2", ecgHeight);

  const tooltip = d3.select("#tooltip");

  // Create a shared overlay on EDA chart.
  edaG
    .append("rect")
    .attr("class", "overlay")
    .attr("width", edaWidth)
    .attr("height", edaHeight)
    .style("fill", "none")
    .style("pointer-events", "all")
    .on("mousemove", function (event) {
      const [xPos] = d3.pointer(event, this);
      const t = xScaleEDA.invert(xPos);
      updateLinkedTooltip(
        t,
        xScaleEDA,
        xScaleECG,
        yScaleEDA,
        yScaleECG,
        edaMarker,
        ecgMarker,
        tooltip
      );
    })
    .on("mouseout", () => {
      tooltip.classed("hidden", true);
      edaMarker.style("opacity", 0);
      ecgMarker.style("opacity", 0);
    });

  // Overlay for ECG chart.
  ecgG
    .append("rect")
    .attr("class", "overlay")
    .attr("width", ecgWidth)
    .attr("height", ecgHeight)
    .style("fill", "none")
    .style("pointer-events", "all")
    .on("mousemove", function (event) {
      const [xPos] = d3.pointer(event, this);
      const t = xScaleECG.invert(xPos);
      updateLinkedTooltip(
        t,
        xScaleEDA,
        xScaleECG,
        yScaleEDA,
        yScaleECG,
        edaMarker,
        ecgMarker,
        tooltip
      );
    })
    .on("mouseout", () => {
      tooltip.classed("hidden", true);
      edaMarker.style("opacity", 0);
      ecgMarker.style("opacity", 0);
    });

  edaSvg
    .append("text")
    .attr("x", (edaWidth + physioMargin.left + physioMargin.right) / 2)
    .attr("y", physioMargin.top - 5)
    .attr("text-anchor", "middle")
    .attr("class", "chart-title")
    .text("EDA over Time");

  ecgSvg
    .append("text")
    .attr("x", (ecgWidth + physioMargin.left + physioMargin.right) / 2)
    .attr("y", physioMargin.top - 5)
    .attr("text-anchor", "middle")
    .attr("class", "chart-title")
    .text("ECG over Time");
}

function updateLinkedTooltip(
  time,
  xScaleEDA,
  xScaleECG,
  yScaleEDA,
  yScaleECG,
  edaMarker,
  ecgMarker,
  tooltip
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

  tooltip
    .html(
      `Time: ${dEDA.time.toFixed(2)} s<br>` +
        `EDA: ${dEDA.EDA.toFixed(2)} μS<br>` +
        `ECG: ${dECG.ECG.toFixed(2)} mV`
    )
    .style("left", d3.pointer(event)[0] + 10 + "px")
    .style("top", d3.pointer(event)[1] - 28 + "px")
    .classed("hidden", false);
}

// When the global subject drop-down changes, update the behavioral and physiological charts.
d3.select("#subjectSelect").on("change", () => {
  updateResponseDistributions();
  updateLinkedPhysioCharts();
});

updateLinkedPhysioCharts();
