function updateResponseDistributions() {
  if (!window.dataBehavioral) return;

  // Clear previous contents.
  d3.select("#calmingHist").selectAll("*").remove();
  d3.select("#vexingHist").selectAll("*").remove();

  // Group data by subject and session.
  const subjects = Array.from(
    d3.group(window.dataBehavioral, (d) => d.Subject),
    ([subject, data]) => ({ subject, data })
  );

  // For each subject, filter data by session.
  subjects.forEach((s) => {
    // Filter data for Calming and Vexing separately.
    const calmingData = s.data.filter((d) => d.Session === "Calming");
    const vexingData = s.data.filter((d) => d.Session === "Vexing");

    // Create a small SVG for each subject's histogram.
    const width = 250,
      height = 150,
      marginHist = { top: 20, right: 20, bottom: 30, left: 30 };

    // -------------------------------
    // Histogram for Calming:
    // -------------------------------
    if (calmingData.length > 0) {
      const svgCalm = d3
        .select("#calmingHist")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .classed("facetSvg", true);
      const gCalm = svgCalm
        .append("g")
        .attr("transform", `translate(${marginHist.left},${marginHist.top})`);

      const plotWidth = width - marginHist.left - marginHist.right;
      const plotHeight = height - marginHist.top - marginHist.bottom;

      // Create x scale from the range of Response_Time.
      const xCalm = d3
        .scaleLinear()
        .domain(d3.extent(calmingData, (d) => d.Response_Time))
        .nice()
        .range([0, plotWidth]);

      const histogram = d3
        .bin()
        .domain(xCalm.domain())
        .thresholds(xCalm.ticks(20));
      const binsCalm = histogram(calmingData.map((d) => d.Response_Time));

      // Create y scale based on bin counts.
      const yCalm = d3
        .scaleLinear()
        .domain([0, d3.max(binsCalm, (d) => d.length)])
        .range([plotHeight, 0])
        .nice();

      // Draw histogram bars.
      gCalm
        .selectAll("rect")
        .data(binsCalm)
        .join("rect")
        .attr("x", (d) => xCalm(d.x0) + 1)
        .attr("y", (d) => yCalm(d.length))
        .attr("width", (d) => Math.max(0, xCalm(d.x1) - xCalm(d.x0) - 1))
        .attr("height", (d) => plotHeight - yCalm(d.length))
        .attr("fill", "steelblue");

      // Add X-axis.
      gCalm
        .append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0,${plotHeight})`)
        .call(d3.axisBottom(xCalm).ticks(5));

      // Add Y-axis.
      gCalm
        .append("g")
        .attr("class", "y-axis")
        .call(d3.axisLeft(yCalm).ticks(5));

      // Chart title.
      svgCalm
        .append("text")
        .attr("x", width / 2)
        .attr("y", marginHist.top - 5)
        .attr("text-anchor", "middle")
        .attr("class", "chart-title")
        .text(s.subject + " Calm");
    }

    // -------------------------------
    // Histogram for Vexing:
    // -------------------------------
    if (vexingData.length > 0) {
      const svgVex = d3
        .select("#vexingHist")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .classed("facetSvg", true);
      const gVex = svgVex
        .append("g")
        .attr("transform", `translate(${marginHist.left},${marginHist.top})`);

      const plotWidth = width - marginHist.left - marginHist.right;
      const plotHeight = height - marginHist.top - marginHist.bottom;

      const xVex = d3
        .scaleLinear()
        .domain(d3.extent(vexingData, (d) => d.Response_Time))
        .nice()
        .range([0, plotWidth]);

      const histogram = d3
        .bin()
        .domain(xVex.domain())
        .thresholds(xVex.ticks(20));
      const binsVex = histogram(vexingData.map((d) => d.Response_Time));

      const yVex = d3
        .scaleLinear()
        .domain([0, d3.max(binsVex, (d) => d.length)])
        .range([plotHeight, 0])
        .nice();

      gVex
        .selectAll("rect")
        .data(binsVex)
        .join("rect")
        .attr("x", (d) => xVex(d.x0) + 1)
        .attr("y", (d) => yVex(d.length))
        .attr("width", (d) => Math.max(0, xVex(d.x1) - xVex(d.x0) - 1))
        .attr("height", (d) => plotHeight - yVex(d.length))
        .attr("fill", "tomato");

      // Add X-axis.
      gVex
        .append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0,${plotHeight})`)
        .call(d3.axisBottom(xVex).ticks(5));

      // Add Y-axis.
      gVex
        .append("g")
        .attr("class", "y-axis")
        .call(d3.axisLeft(yVex).ticks(5));

      // Chart title.
      svgVex
        .append("text")
        .attr("x", width / 2)
        .attr("y", marginHist.top - 5)
        .attr("text-anchor", "middle")
        .attr("class", "chart-title")
        .text(s.subject + " Vexing");
    }
  });
}

// Immediately update the response distributions when behavioral data is ready.
