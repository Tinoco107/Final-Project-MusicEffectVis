function updateResponseDistributions() {
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
}

// Immediately update the response distributions when behavioral data is ready.
