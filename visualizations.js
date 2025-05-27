// Global margin configuration for all charts.
const margin = { top: 20, right: 20, bottom: 50, left: 60 };

/* --- Visualization 1: Update Histogram --- */
function updateHistogram() {
  if (!window.dataBehavioral) return;

  const session = d3.select("#histSessionSelect").property("value");
  const dataFiltered = session === "All" ? window.dataBehavioral : window.dataBehavioral.filter(d => d.Session === session);

  const svg = d3.select("#histogramChart");
  svg.selectAll("*").remove();
  const width = +svg.attr("width") - margin.left - margin.right;
  const height = +svg.attr("height") - margin.top - margin.bottom;
  const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

  const x = d3.scaleLinear()
    .domain(d3.extent(dataFiltered, d => d.Response_Time))
    .nice()
    .range([0, width]);

  const binsGenerator = d3.bin().domain(x.domain()).thresholds(30);
  const bins = binsGenerator(dataFiltered.map(d => d.Response_Time));

  const y = d3.scaleLinear()
    .domain([0, d3.max(bins, d => d.length)])
    .range([height, 0])
    .nice();

  g.append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(d3.axisBottom(x));
  g.append("g")
    .call(d3.axisLeft(y));

  const tooltip = d3.select("#tooltip");

  g.selectAll(".bar")
    .data(bins)
    .join("rect")
    .attr("class", "bar")
    .attr("x", d => x(d.x0) + 1)
    .attr("y", d => y(d.length))
    .attr("width", d => Math.max(0, x(d.x1) - x(d.x0) - 2))
    .attr("height", d => height - y(d.length))
    .style("fill", "steelblue")
    .style("opacity", 0.7)
    .on("mouseover", (event, d) => {
      tooltip.classed("hidden", false)
        .html(`Range: ${Math.round(d.x0)}–${Math.round(d.x1)} ms<br>Count: ${d.length}<br><em>This may reflect moments of attentional shifts.</em>`)
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 28) + "px");
    })
    .on("mouseout", () => tooltip.classed("hidden", true));

  svg.append("text")
    .attr("x", (width + margin.left + margin.right) / 2)
    .attr("y", margin.top - 5)
    .attr("text-anchor", "middle")
    .attr("class", "chart-title")
    .text("Response Time Distribution");
}

/* --- Visualization 2: Update Line Chart --- */
function updateLineChart() {
  if (!window.dataBehavioral) return;

  const session = d3.select("#lineSessionSelect").property("value");
  const dataFiltered = session === "Both" ? window.dataBehavioral : window.dataBehavioral.filter(d => d.Session === session);

  d3.select("#lineChart").selectAll("*").remove();
  const svg = d3.select("#lineChart");
  const width = +svg.attr("width") - margin.left - margin.right;
  const height = +svg.attr("height") - margin.top - margin.bottom;
  const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

  const nested = d3.rollups(
    dataFiltered,
    v => d3.mean(v, d => d.Response_Time),
    d => d.Session,
    d => d.TrialNumber
  );

  const linesData = nested.map(([sessionName, trials]) => ({
    session: sessionName,
    values: Array.from(trials, ([trial, avg]) => ({ trial: +trial, avg: avg }))
              .sort((a, b) => d3.ascending(a.trial, b.trial))
  }));

  const trialsExtent = d3.extent(dataFiltered, d => d.TrialNumber);
  const x = d3.scaleLinear()
    .domain(trialsExtent)
    .range([0, width]);

  const y = d3.scaleLinear()
    .domain([
      d3.min(linesData, l => d3.min(l.values, d => d.avg)),
      d3.max(linesData, l => d3.max(l.values, d => d.avg))
    ])
    .nice()
    .range([height, 0]);

  g.append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(d3.axisBottom(x).ticks(10).tickFormat(d3.format("d")));
  g.append("g")
    .call(d3.axisLeft(y));

  const color = d3.scaleOrdinal()
    .domain(["Calming", "Vexing"])
    .range(["steelblue", "tomato"]);

  const line = d3.line()
    .x(d => x(d.trial))
    .y(d => y(d.avg));

  const tooltip = d3.select("#tooltip");

  linesData.forEach(l => {
    g.append("path")
      .datum(l.values)
      .attr("fill", "none")
      .attr("stroke", color(l.session))
      .attr("stroke-width", 2)
      .attr("d", line);

    g.selectAll("circle." + l.session)
      .data(l.values)
      .join("circle")
      .attr("class", l.session)
      .attr("cx", d => x(d.trial))
      .attr("cy", d => y(d.avg))
      .attr("r", 4)
      .attr("fill", color(l.session))
      .on("mouseover", (event, d) => {
        tooltip.classed("hidden", false)
          .html(`Trial: ${d.trial}<br>Avg Time: ${d.avg.toFixed(1)} ms<br><em>This moment may indicate a key cognitive shift.</em>`)
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 28) + "px");
      })
      .on("mouseout", () => tooltip.classed("hidden", true));
  });

  // Add an annotation to help interpret the data.
  const midTrial = Math.floor((trialsExtent[0] + trialsExtent[1]) / 2);
  g.append("text")
    .attr("x", x(midTrial))
    .attr("y", y(d3.mean(linesData[0].values, d => d.avg)) - 20)
    .attr("class", "annotation")
    .text("Possible cognitive transition");

  svg.append("text")
    .attr("x", (width + margin.left + margin.right) / 2)
    .attr("y", margin.top - 5)
    .attr("text-anchor", "middle")
    .attr("class", "chart-title")
    .text("Average Response Time Over Trials");
}

/* --- Visualization 3: Update Boxplot --- */
function updateBoxPlot() {
  if (!window.dataBehavioral) return;

  const session = d3.select("#boxSessionSelect").property("value");
  const dataFiltered = session === "Both" ? window.dataBehavioral : window.dataBehavioral.filter(d => d.Session === session);

  d3.select("#boxplotChart").selectAll("*").remove();
  const svg = d3.select("#boxplotChart");
  const width = +svg.attr("width") - margin.left - margin.right;
  const height = +svg.attr("height") - margin.top - margin.bottom;
  const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

  const groups = d3.group(dataFiltered, d => d.Session + " " + (d.Is_Target ? "Target" : "NonTarget"));
  let boxData = [];
  groups.forEach((values, key) => {
    values.sort((a, b) => d3.ascending(a.Response_Time, b.Response_Time));
    const responseTimes = values.map(d => d.Response_Time);
    boxData.push({
      group: key,
      values: responseTimes,
      min: d3.min(responseTimes),
      q1: d3.quantile(responseTimes, 0.25),
      median: d3.quantile(responseTimes, 0.5),
      q3: d3.quantile(responseTimes, 0.75),
      max: d3.max(responseTimes)
    });
  });

  const groupsNames = boxData.map(d => d.group);
  const x = d3.scaleBand()
    .domain(groupsNames)
    .range([0, width])
    .paddingInner(0.3)
    .paddingOuter(0.2);

  const allValues = boxData.flatMap(d => d.values);
  const y = d3.scaleLinear()
    .domain([d3.min(allValues), d3.max(allValues)])
    .nice()
    .range([height, 0]);

  g.append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(d3.axisBottom(x));
  g.append("g")
    .call(d3.axisLeft(y));

  const tooltip = d3.select("#tooltip");

  boxData.forEach(d => {
    const center = x(d.group) + x.bandwidth() / 2;
    const boxWidth = x.bandwidth() * 0.7;
    
    g.append("rect")
      .attr("x", center - boxWidth / 2)
      .attr("y", y(d.q3))
      .attr("width", boxWidth)
      .attr("height", y(d.q1) - y(d.q3))
      .attr("stroke", "black")
      .attr("fill", d.group.includes("Calming") ? "steelblue" : "tomato")
      .attr("opacity", 0.6)
      .on("mouseover", (event) => {
        tooltip.classed("hidden", false)
          .html(`${d.group}<br>Median: ${d.median}<br>Q1: ${d.q1}<br>Q3: ${d.q3}<br><em>Variability may reflect cognitive fluctuations.</em>`)
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 28) + "px");
      })
      .on("mouseout", () => tooltip.classed("hidden", true));
      
    g.append("line")
      .attr("x1", center - boxWidth / 2)
      .attr("x2", center + boxWidth / 2)
      .attr("y1", y(d.median))
      .attr("y2", y(d.median))
      .attr("stroke", "black");

    g.append("line")
      .attr("x1", center)
      .attr("x2", center)
      .attr("y1", y(d.min))
      .attr("y2", y(d.q1))
      .attr("stroke", "black");

    g.append("line")
      .attr("x1", center)
      .attr("x2", center)
      .attr("y1", y(d.q3))
      .attr("y2", y(d.max))
      .attr("stroke", "black");

    g.append("line")
      .attr("x1", center - boxWidth / 4)
      .attr("x2", center + boxWidth / 4)
      .attr("y1", y(d.min))
      .attr("y2", y(d.min))
      .attr("stroke", "black");

    g.append("line")
      .attr("x1", center - boxWidth / 4)
      .attr("x2", center + boxWidth / 4)
      .attr("y1", y(d.max))
      .attr("y2", y(d.max))
      .attr("stroke", "black");
  });

  svg.append("text")
    .attr("x", (width + margin.left + margin.right) / 2)
    .attr("y", margin.top - 5)
    .attr("text-anchor", "middle")
    .attr("class", "chart-title")
    .text("Target vs. Non-Target Response Times");
}

d3.select("#histSessionSelect").on("change", updateHistogram);
d3.select("#lineSessionSelect").on("change", updateLineChart);
d3.select("#boxSessionSelect").on("change", updateBoxPlot);
