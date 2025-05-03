async function createGraph() {
  /**
   * @typedef {Object} CountryData
   * @property {string} country - The name of the country
   * @property {number} population - Number of players from this country
   * @property {string} percentage - Percentage of total players from this country (formatted with %)
   */

  /**
   * @typedef {Object} SeasonData
   * @property {number} season - Season number
   * @property {number} total_players - Total number of players in the season
   * @property {number} average_mmr - Average matchmaking rating
   * @property {number} median_mmr - Median matchmaking rating
   * @property {CountryData[]} data - Array of country distribution data
   */

  /**
   * Array containing player distribution data across multiple seasons
   * @type {SeasonData[]}
   */
  const data = await d3.json("/data/country-dist.json");
  const margin = { top: 50, right: 30, bottom: 90, left: 60 },
    width = 1200 - margin.left - margin.right,
    height = 800 - margin.top - margin.bottom;

  const svg = d3
    .select("#svg_bar_graph")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Process data for stacked bar chart
  // Get all unique countries across all seasons
  const allCountries = [
    ...new Set(data.flatMap((d) => d.data.map((c) => c.country))),
  ];

  // Get all seasons
  const seasons = data.map((d) => d.season);

  // Create a dataset in the format needed for stacked bars
  const stackedData = allCountries.map((country) => {
    const countryData = { country };
    seasons.forEach((season) => {
      const seasonData = data.find((d) => d.season === season);
      const countryInSeason = seasonData.data.find(
        (c) => c.country === country
      );
      countryData[`season${season}`] = countryInSeason
        ? countryInSeason.population
        : 0;
    });
    return countryData;
  });

  // Sort countries by total player count across all seasons
  stackedData.sort((a, b) => {
    const totalA = seasons.reduce(
      (sum, season) => sum + (a[`season${season}`] || 0),
      0
    );
    const totalB = seasons.reduce(
      (sum, season) => sum + (b[`season${season}`] || 0),
      0
    );
    return totalB - totalA;
  });

  // Limit to top countries if there are too many
  const topCountries = stackedData.slice(0, 20);

  // Create subgroups (seasons) for stacking
  const subgroups = seasons.map((s) => `season${s}`);

  // Create x scale for countries
  const x = d3
    .scaleBand()
    .domain(topCountries.map((d) => d.country))
    .range([0, width])
    .padding(0.2);

  // Add X axis
  svg
    .append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x))
    .selectAll("text")
    .attr("transform", "translate(-10,0)rotate(-45)")
    .style("text-anchor", "end");

  // Add X axis label
  svg
    .append("text")
    .attr("text-anchor", "middle")
    .attr("x", width / 2)
    .attr("y", height + margin.bottom - 10)
    .text("Countries");

  // Find the maximum total players for any country across all seasons
  const maxTotal = d3.max(topCountries, (d) => {
    return d3.sum(subgroups, (key) => d[key] || 0);
  });

  // Create y scale
  const y = d3.scaleLinear().domain([0, maxTotal]).range([height, 0]);

  // Add Y axis
  svg.append("g").call(d3.axisLeft(y));

  // Add Y axis label
  svg
    .append("text")
    .attr("text-anchor", "middle")
    .attr("transform", "rotate(-90)")
    .attr("y", -margin.left + 15)
    .attr("x", -height / 2)
    .text("Number of Players");

  // Color palette for seasons
  const color = d3.scaleOrdinal().domain(subgroups).range(d3.schemeCategory10);

  // Stack the data
  const stackGenerator = d3.stack().keys(subgroups);
  const stackedValues = stackGenerator(topCountries);

  // Create a title
  svg
    .append("text")
    .attr("x", width / 2)
    .attr("y", -20)
    .attr("text-anchor", "middle")
    .style("font-size", "16px")
    .text("Player Country Distribution by Season");

  // Add legend
  const legend = svg
    .append("g")
    .attr("transform", `translate(${width - 100}, 0)`);

  seasons.forEach((season, i) => {
    const legendRow = legend
      .append("g")
      .attr("transform", `translate(0, ${i * 20})`)
      .attr("class", `legend-item season${season}`);

    legendRow
      .append("rect")
      .attr("width", 15)
      .attr("height", 15)
      .attr("fill", color(`season${season}`));

    legendRow
      .append("text")
      .attr("x", 20)
      .attr("y", 12)
      .text(`Season ${season}`)
      .style("font-size", "12px");
  });

  // Create tooltip div
  const tooltip = d3
    .select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0)
    .style("position", "absolute")
    .style("background-color", "white")
    .style("border", "solid")
    .style("border-width", "1px")
    .style("border-radius", "5px")
    .style("padding", "10px")
    .style("pointer-events", "none")
    .style("font-size", "12px")
    .style("box-shadow", "0 0 10px rgba(0,0,0,0.2)");

  // Show the bars
  svg
    .append("g")
    .selectAll("g")
    .data(stackedValues)
    .join("g")
    .attr("fill", (d) => color(d.key))
    .attr("class", (d) => "seasonRect " + d.key)
    .selectAll("rect")
    .data((d) => d)
    .join("rect")
    .attr("x", (d) => x(d.data.country))
    .attr("y", (d) => y(d[1]))
    .attr("height", (d) => y(d[0]) - y(d[1]))
    .attr("width", x.bandwidth())
    .attr("stroke", "white")
    .attr("stroke-width", 0.5)
    .on("mouseover", function (event, d) {
      // Get the season group name from parent
      const seasonGroup = d3.select(this.parentNode).datum().key;
      const seasonNum = seasonGroup.replace("season", "");

      // Reduce opacity of all rectangles
      d3.selectAll(".seasonRect").style("opacity", 0.2);

      // Highlight this season across all countries
      d3.selectAll("." + seasonGroup).style("opacity", 1);

      // Highlight the legend item
      d3.select(`.legend-item.${seasonGroup}`).style("font-weight", "bold");

      // Find the season data
      const seasonData = data.find((s) => s.season == seasonNum);

      // Calculate the number of players for this country and season
      const playerCount = d[1] - d[0];

      // Calculate percentage of total players in this season
      const percentage = (
        (playerCount / seasonData.total_players) *
        100
      ).toFixed(2);

      // Show and position the tooltip
      tooltip.transition().duration(200).style("opacity", 0.9);

      tooltip
        .html(
          `
        <strong>${d.data.country}</strong><br>
        Season: ${seasonNum}<br>
        Players: ${playerCount.toLocaleString()}<br>
        Percentage: ${percentage}%
      `
        )
        .style("left", event.pageX + 10 + "px")
        .style("top", event.pageY - 28 + "px");
    })
    .on("mousemove", function (event) {
      // Update tooltip position as mouse moves
      tooltip
        .style("left", event.pageX + 10 + "px")
        .style("top", event.pageY - 28 + "px");
    })
    .on("mouseout", function (event, d) {
      // Restore opacity
      d3.selectAll(".seasonRect").style("opacity", 1);

      // Reset legend
      d3.selectAll(".legend-item").style("font-weight", "normal");

      // Hide tooltip
      tooltip.transition().duration(500).style("opacity", 0);
    });
}

document.addEventListener("DOMContentLoaded", createGraph);
