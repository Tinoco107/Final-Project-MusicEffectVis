// Global margin configuration for the Biopac EDA chart.
const edaMargin = { top: 20, right: 20, bottom: 50, left: 60 };

function updateBiopacEDA() {
  if (!window.dataBiopacEDA) return;
  
  const selectedSubject = d3.select("#edaSubjectSelect").property("value");
  // Filter using string comparison; our subject values are like "3F", "4F", etc.
  const dataFiltered = selectedSubject === "All"
    ? window.dataBiopacEDA
    : window.dataBiopacEDA.filter(d => String(d.subject) === selectedSubject);
  
  if (dataFiltered.length === 0) {
    console.warn("No valid EDA data available for the selected subject.");
    d3.select("#edaChart").selectAll("*").remove();
    d3.select("#edaChart")
      .append("text")
      .attr("x", 10)
      .attr("y", 20)
      .text("No data available for subject " + selectedSubject);
    return;
  }
  
  const svg = d3.select("#edaChart");
  svg.selectAll("*").remove();
  const width = +svg.attr("width") - edaMargin.left - edaMargin.right;
  const height = +svg.attr("height") - edaMargin.top - edaMargin.bottom;
  const g = svg.append("g").attr("transform", `translate(${edaMargin.left},${edaMargin.top})`);
  
  // x-scale from the computed time values.
  const x = d3.scaleLinear()
    .domain(d3.extent(dataFiltered, d => d.time))
    .nice()
    .range([0, width]);
  
  // y-scale for EDA values.
  const y = d3.scaleLinear()
    .domain([d3.min(dataFiltered, d => d.EDA), d3.max(dataFiltered, d => d.EDA)])
    .nice()
    .range([height, 0]);
  
  g.append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(d3.axisBottom(x));
  g.append("g")
    .call(d3.axisLeft(y));
  
  const line = d3.line()
    .x(d => x(d.time))
    .y(d => y(d.EDA));
  
  g.append("path")
    .datum(dataFiltered)
    .attr("fill", "none")
    .attr("stroke", "purple")
    .attr("stroke-width", 2)
    .attr("d", line);
  
  const tooltip = d3.select("#tooltip");
  g.selectAll("circle")
    .data(dataFiltered)
    .join("circle")
    .attr("cx", d => x(d.time))
    .attr("cy", d => y(d.EDA))
    .attr("r", 3)
    .attr("fill", "purple")
    .on("mouseover", (event, d) => {
      tooltip.classed("hidden", false)
        .html(`Time: ${d.time.toFixed(2)} s<br>EDA: ${d.EDA.toFixed(2)} μS<br><em>Physiological arousal measure</em>`)
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 28) + "px");
    })
    .on("mouseout", () => tooltip.classed("hidden", true));
  
  svg.append("text")
    .attr("x", (width + edaMargin.left + edaMargin.right) / 2)
    .attr("y", edaMargin.top - 5)
    .attr("text-anchor", "middle")
    .attr("class", "chart-title")
    .text("Biopac EDA over Time");
}

d3.select("#edaSubjectSelect").on("change", updateBiopacEDA);
