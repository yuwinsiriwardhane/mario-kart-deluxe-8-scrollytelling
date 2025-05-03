async function createGraph() {
  /**
   * @typedef {Object} MarioKartCombo
   * @property {number} index - Row index in the CSV
   * @property {string} Driver - Character name
   * @property {string} Vehicle - Kart type
   * @property {string} Tire - Tire type
   * @property {string} Glider - Glider type
   * @property {number} GroundSpeed - Speed on ground tracks
   * @property {number} WaterSpeed - Speed on water
   * @property {number} AirSpeed - Speed while in the air
   * @property {number} AntiGravitySpeed - Speed in anti-gravity sections
   * @property {number} Acceleration - How quickly the kart reaches top speed
   * @property {number} Weight - Weight of the combo
   * @property {number} GroundHandling - Handling on ground tracks
   * @property {number} WaterHandling - Handling on water
   * @property {number} AirHandling - Handling in the air
   * @property {number} AntiGravityHandling - Handling in anti-gravity sections
   * @property {number} Traction - Grip on the track
   * @property {number} MiniTurbo - Mini-turbo boost effectiveness
   * @property {number} Total - Sum of all stats
   */

  /**
   * Array of Mario Kart combo objects, each representing a unique combination of driver, vehicle, tire, and glider.
   * @type {MarioKartCombo[]}
   */
  const data = await d3.csv("/data/MINIFIED.csv");

  // Parse numeric values
  data.forEach((d) => {
    d.GroundSpeed = +d.GroundSpeed;
    d.WaterSpeed = +d.WaterSpeed;
    d.AirSpeed = +d.AirSpeed;
    d.AntiGravitySpeed = +d.AntiGravitySpeed;
    d.Acceleration = +d.Acceleration;
    d.Weight = +d.Weight;
    d.GroundHandling = +d.GroundHandling;
    d.WaterHandling = +d.WaterHandling;
    d.AirHandling = +d.AirHandling;
    d.AntiGravityHandling = +d.AntiGravityHandling;
    d.Traction = +d.Traction;
    d.MiniTurbo = +d.MiniTurbo;
    d.Total = +d.Total;
  });

  // Calculate the threshold for top 10% based on Total score
  const totalExtent = d3.extent(data, (d) => d.Total);
  const totalThreshold =
    totalExtent[1] - (totalExtent[1] - totalExtent[0]) * 0.1; // Top 10%

  // Filter data to only include top 10% of combinations
  const filteredData = data.filter((d) => d.Total >= totalThreshold);

  // Set dimensions and margins
  const margin = { top: 50, right: 150, bottom: 120, left: 80 },
    width = 1400 - margin.left - margin.right,
    height = 800 - margin.top - margin.bottom;

  // Create SVG element
  const svg = d3
    .select("#svg_parallel_chart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Define dimensions to include in the chart
  const dimensions = [
    "GroundSpeed",
    "WaterSpeed",
    "AirSpeed",
    "AntiGravitySpeed",
    "Acceleration",
    "Weight",
    "GroundHandling",
    "WaterHandling",
    "AirHandling",
    "AntiGravityHandling",
    "Traction",
    "MiniTurbo",
  ];

  // User-friendly dimension labels
  const dimensionLabels = {
    GroundSpeed: "Ground Speed",
    WaterSpeed: "Water Speed",
    AirSpeed: "Air Speed",
    AntiGravitySpeed: "Anti-Gravity Speed",
    Acceleration: "Acceleration",
    Weight: "Weight",
    GroundHandling: "Ground Handling",
    WaterHandling: "Water Handling",
    AirHandling: "Air Handling",
    AntiGravityHandling: "Anti-Gravity Handling",
    Traction: "Traction",
    MiniTurbo: "Mini-Turbo",
  };

  // Calculate the range (max - min) of stats for each build
  const statRanges = filteredData.map((item) => {
    const statValues = [
      item.GroundSpeed,
      item.WaterSpeed,
      item.AirSpeed,
      item.AntiGravitySpeed,
      item.Acceleration,
      item.Weight,
      item.GroundHandling,
      item.WaterHandling,
      item.AirHandling,
      item.AntiGravityHandling,
      item.Traction,
      item.MiniTurbo,
    ];
    const max = Math.max(...statValues);
    const min = Math.min(...statValues);
    return max - min;
  });

  // Group data into categories based on their stat ranges
  filteredData.forEach((d, i) => {
    // Sort ranges to determine percentage thresholds
    const sortedRanges = [...statRanges].sort((a, b) => a - b); // Sort low to high (smaller range = more balanced)
    const topThreshold = sortedRanges[Math.floor(sortedRanges.length * 0.1)]; // Top 10% (smallest ranges)
    const excellentThreshold =
      sortedRanges[Math.floor(sortedRanges.length * 0.3)]; // Top 30%
    const goodThreshold = sortedRanges[Math.floor(sortedRanges.length * 0.6)]; // Top 60%

    // Store the range value for coloring
    d.statRange = statRanges[i];

    // Categorize based on percentile position (smaller range = better balance)
    if (d.statRange <= topThreshold) {
      d.group = "exceptional"; // Most balanced builds
    } else if (d.statRange <= excellentThreshold) {
      d.group = "excellent";
    } else if (d.statRange <= goodThreshold) {
      d.group = "good";
    } else {
      d.group = "average";
    }
  });

  // Create linear color scale based on stat range values
  const colorScale = d3
    .scaleSequential(d3.interpolateInferno)
    .domain([d3.max(statRanges), d3.min(statRanges)]); // Reversed domain so smaller ranges (more balanced) get brighter colors

  // Create scales for each dimension
  const y = {};
  for (let i = 0; i < dimensions.length; i++) {
    const name = dimensions[i];
    y[name] = d3
      .scaleLinear()
      .domain(d3.extent(filteredData, (d) => d[name]))
      .range([height, 0]);
  }

  // Create x scale for dimensions
  const x = d3.scalePoint().range([0, width]).padding(1).domain(dimensions);

  // Function to draw a path for a data point
  function path(d) {
    return d3.line()(dimensions.map((p) => [x(p), y[p](d[p])]));
  }

  // Create tooltip div that will be shown on hover
  const tooltip = d3
    .select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("position", "absolute")
    .style("visibility", "hidden")
    .style("background-color", "rgba(255, 255, 255, 0.95)")
    .style("border", "2px solid #666")
    .style("border-radius", "6px")
    .style("padding", "12px")
    .style("font-size", "12px")
    .style("box-shadow", "0px 0px 10px rgba(0, 0, 0, 0.5)")
    .style("max-width", "320px")
    .style("min-width", "250px")
    .style("pointer-events", "none") // Prevent tooltip from interfering with mouse events
    .style("z-index", "10000") // Ensure very high z-index
    .style("opacity", "0") // Start with opacity 0 for fade-in effect
    .style("transition", "opacity 0.2s");

  // Calculate ranks based on total stat and store in data
  const sortedByTotal = [...filteredData].sort((a, b) => b.Total - a.Total);
  sortedByTotal.forEach((d, i) => {
    d.rank = i + 1;
    d.totalRank = `${i + 1} of ${filteredData.length}`;

    // Calculate category-specific rank
    const sameGroupItems = sortedByTotal.filter(
      (item) => item.group === d.group
    );
    const groupRank =
      sameGroupItems.findIndex((item) => item.Total === d.Total) + 1;
    d.groupRank = `${groupRank} of ${sameGroupItems.length}`;
  });

  // Add background lines for all combinations
  svg
    .append("g")
    .selectAll("path")
    .data(filteredData)
    .join("path")
    .attr("d", path)
    .attr("class", (d) => `line group-${d.group}`)
    .attr("stroke", (d) => colorScale(d.statRange))
    .attr("stroke-width", 1.8)
    .attr("fill", "none")
    .attr("opacity", 0.7);

  // Create brush function for each axis
  function brush() {
    // Get the active brushes
    const actives = [];
    svg
      .selectAll(".brush")
      .filter(function () {
        return d3.brushSelection(this) !== null;
      })
      .each(function (key) {
        actives.push({
          dimension: key,
          extent: d3.brushSelection(this).map(y[key].invert),
        });
      });

    // If no brushes, reset all
    if (actives.length === 0) {
      svg.selectAll(".line").style("display", null);
      return;
    }

    // Test each data point against all active brushes
    svg.selectAll(".line").style("display", (d) => {
      return actives.every((active) => {
        const dim = active.dimension;
        return active.extent[1] <= d[dim] && d[dim] <= active.extent[0];
      })
        ? null
        : "none";
    });
  }

  // Add a group element for each dimension
  const axes = svg
    .selectAll(".dimension")
    .data(dimensions)
    .enter()
    .append("g")
    .attr("class", "dimension")
    .attr("transform", (d) => `translate(${x(d)})`);

  // Add axis for each dimension with improved labels
  axes
    .append("g")
    .attr("class", "axis")
    .each(function (d) {
      d3.select(this).call(d3.axisLeft(y[d]));
    })
    .append("text")
    .style("text-anchor", "middle")
    .attr("y", -15)
    .attr("dy", "0.71em")
    .text((d) => dimensionLabels[d])
    .style("fill", "white")
    .style("font-weight", "bold")
    .style("font-size", "12px");

  // Add brushing to each axis
  axes
    .append("g")
    .attr("class", "brush")
    .each(function (d) {
      d3.select(this).call(
        d3
          .brushY()
          .extent([
            [-10, 0],
            [10, height],
          ])
          .on("brush", brush)
          .on("end", brush)
      );
    });

  // Add x-axis label at the bottom
  svg
    .append("text")
    .attr("x", width / 2)
    .attr("y", height + 60)
    .attr("text-anchor", "middle")
    .style("font-size", "16px")
    .style("font-weight", "bold")
    .text("Performance Attributes");

  // Highlight function for hovering
  const highlight = function (event, d) {
    const selectedGroup = d.group;

    // Dim all lines
    svg.selectAll(".line").transition().duration(200).style("opacity", 0.1);

    // Highlight lines in the same group
    svg
      .selectAll(`.group-${selectedGroup}`)
      .transition()
      .duration(200)
      .style("opacity", 1)
      .style("z-index", 10);

    // Create tooltip content
    let tooltipContent = `
      <div style="font-weight:bold; margin-bottom:5px; font-size:14px; border-bottom:1px solid #999; padding-bottom:5px; color:#333;">
        Combination Details
      </div>
      <div style="margin-bottom:5px"><b>Driver:</b> ${d.Driver}</div>
      <div style="margin-bottom:5px"><b>Vehicle:</b> ${d.Vehicle}</div>
      <div style="margin-bottom:5px"><b>Tire:</b> ${d.Tire}</div>
      <div style="margin-bottom:5px"><b>Glider:</b> ${d.Glider}</div>
      <div style="margin-bottom:5px; border-top:1px solid #999; margin-top:8px; padding-top:5px;">
        <b>Overall Rank:</b> ${d.totalRank}
      </div>
      <div style="font-weight:bold; margin:8px 0; border-top:1px solid #999; padding-top:5px; color:#333;">Stats</div>
      <div style="display:grid; grid-template-columns:1fr 1fr; grid-gap:5px;">
        <div><b>Ground Speed:</b> ${d.GroundSpeed}</div>
        <div><b>Water Speed:</b> ${d.WaterSpeed}</div>
        <div><b>Air Speed:</b> ${d.AirSpeed}</div>
        <div><b>Anti-G Speed:</b> ${d.AntiGravitySpeed}</div>
        <div><b>Acceleration:</b> ${d.Acceleration}</div>
        <div><b>Weight:</b> ${d.Weight}</div>
        <div><b>Ground Handling:</b> ${d.GroundHandling}</div>
        <div><b>Water Handling:</b> ${d.WaterHandling}</div>
        <div><b>Air Handling:</b> ${d.AirHandling}</div>
        <div><b>Anti-G Handling:</b> ${d.AntiGravityHandling}</div>
        <div><b>Traction:</b> ${d.Traction}</div>
        <div><b>Mini-Turbo:</b> ${d.MiniTurbo}</div>
      </div>
      <div style="margin-top:8px; border-top:1px solid #999; padding-top:5px; font-weight:bold;">
        Total Stats: ${d.Total}
      </div>
    `;

    // Position and show tooltip with delay
    tooltip
      .html(tooltipContent)
      .style("left", event.pageX + 20 + "px")
      .style("top", event.pageY - 20 + "px")
      .style("visibility", "visible")
      .style("opacity", "1");
  };

  // Reset highlighting
  const noHighlight = function () {
    svg.selectAll(".line").transition().duration(200).style("opacity", 0.7);
    tooltip.style("opacity", "0").style("visibility", "hidden");
  };

  // Add interactivity to lines with better handling
  svg
    .selectAll(".line")
    .on("mouseover", highlight)
    .on("mousemove", function (event) {
      // Ensure the tooltip follows the cursor at a comfortable offset
      tooltip
        .style("left", event.pageX + 20 + "px")
        .style("top", event.pageY - 20 + "px");
    })
    .on("mouseout", noHighlight);

  // Add legend with improved descriptions
  const legend = svg
    .append("g")
    .attr("class", "legend")
    .attr("transform", `translate(${width - 85}, 20)`);

  // Add legend title
  legend
    .append("text")
    .attr("x", 0)
    .attr("y", -10)
    .style("font-size", "14px")
    .style("font-weight", "bold")
    .text("Build Balance Categories");

  const legendItems = legend
    .selectAll(".legend-item")
    .data(["exceptional", "excellent", "good", "average"])
    .enter()
    .append("g")
    .attr("class", "legend-item")
    .attr("transform", (d, i) => `translate(0, ${i * 30 + 20})`);

  // Create gradient stops for legend colors
  const legendColors = [
    d3.interpolateInferno(0.9),
    d3.interpolateInferno(0.6),
    d3.interpolateInferno(0.35),
    d3.interpolateInferno(0.1),
  ];

  legendItems
    .append("rect")
    .attr("x", 0)
    .attr("width", 15)
    .attr("height", 15)
    .attr("fill", (d, i) => legendColors[i]);

  const legendLabels = {
    exceptional: "Highly Balanced Builds (Top 10%)",
    excellent: "Well Balanced Builds (Top 30%)",
    good: "Moderately Balanced (Top 60%)",
    average: "Specialized Builds (Lower 40%)",
  };

  legendItems
    .append("text")
    .attr("x", 25)
    .attr("y", 12)
    .text((d) => legendLabels[d])
    .style("font-size", "12px");

  // Add legend description text
  legend
    .append("text")
    .attr("x", 0)
    .attr("y", 150)
    .style("font-size", "11px")
    .style("font-style", "italic")
    .text("Note: Color intensity indicates balance");

  legend
    .append("text")
    .attr("x", 0)
    .attr("y", 165)
    .style("font-size", "11px")
    .style("font-style", "italic")
    .text("between stats. Brighter colors show");

  legend
    .append("text")
    .attr("x", 0)
    .attr("y", 180)
    .style("font-size", "11px")
    .style("font-style", "italic")
    .text("more balanced, versatile builds.");

  // Add interactivity to legend
  legendItems
    .on("mouseover", function (event, d) {
      // Dim all lines
      svg.selectAll(".line").transition().duration(200).style("opacity", 0.1);

      // Highlight lines in the selected group
      svg
        .selectAll(`.group-${d}`)
        .transition()
        .duration(200)
        .style("opacity", 1);
    })
    .on("mouseout", noHighlight);

  // Add title
  svg
    .append("text")
    .attr("x", width / 2)
    .attr("y", -25)
    .attr("text-anchor", "middle")
    .style("font-size", "18px")
    .style("font-weight", "bold")
    .text("Mario Kart 8 Deluxe - Top 10% Character Builds");

  // Create leaderboard in separate HTML div
  createLeaderboard(filteredData, colorScale);
}

// Function to create leaderboard in the HTML div
function createLeaderboard(data, colorScale) {
  // Get the leaderboard div
  const leaderboardDiv = d3.select("#div_leaderboard");

  // Clear any existing content
  leaderboardDiv.html("");

  // Add styling to the leaderboard div
  leaderboardDiv
    .style("background-color", "rgba(255, 255, 255, 0.9)")
    .style("border", "1px solid #ccc")
    .style("border-radius", "5px")
    .style("padding", "15px")
    .style("box-shadow", "0 2px 5px rgba(0, 0, 0, 0.1)")
    .style("max-width", "800px");

  // ------ TOTAL STATS LEADERBOARD ------
  // Add leaderboard title
  leaderboardDiv
    .append("h3")
    .text("Top 10 Combinations by Total Stats")
    .style("margin-top", "0")
    .style("margin-bottom", "10px")
    .style("font-size", "16px")
    .style("text-align", "center");

  // Get top 10 combinations by Total stats
  const top10Combinations = [...data]
    .sort((a, b) => b.Total - a.Total)
    .slice(0, 10);

  // Create total stats leaderboard table
  createLeaderboardTable(leaderboardDiv, top10Combinations, colorScale);

  // ------ BALANCE LEADERBOARDS ------
  // Add divider
  leaderboardDiv
    .append("hr")
    .style("margin", "20px 0")
    .style("border", "0")
    .style("border-top", "1px solid #ddd");

  // Add balance leaderboards section title
  leaderboardDiv
    .append("h3")
    .text("Build Balance Leaders")
    .style("margin-top", "20px")
    .style("margin-bottom", "15px")
    .style("font-size", "16px")
    .style("text-align", "center");

  // Container for the two balance tables
  const balanceContainer = leaderboardDiv
    .append("div")
    .style("display", "flex")
    .style("justify-content", "space-between")
    .style("gap", "20px");

  // Left container - Most Balanced
  const balancedContainer = balanceContainer.append("div").style("flex", "1");

  balancedContainer
    .append("h4")
    .text("Top 5 Most Balanced Builds")
    .style("margin", "0 0 10px 0")
    .style("font-size", "14px")
    .style("text-align", "center");

  // Get top 5 most balanced combinations (smallest range between stats)
  const top5Balanced = [...data]
    .sort((a, b) => a.statRange - b.statRange)
    .slice(0, 5);

  // Create balanced leaderboard table
  createLeaderboardTable(
    balancedContainer,
    top5Balanced,
    colorScale,
    "balanced"
  );

  // Right container - Most Specialized
  const specializedContainer = balanceContainer
    .append("div")
    .style("flex", "1");

  specializedContainer
    .append("h4")
    .text("Top 5 Most Specialized Builds")
    .style("margin", "0 0 10px 0")
    .style("font-size", "14px")
    .style("text-align", "center");

  // Get top 5 most specialized combinations (largest range between stats)
  const top5Specialized = [...data]
    .sort((a, b) => b.statRange - a.statRange)
    .slice(0, 5);

  // Create specialized leaderboard table
  createLeaderboardTable(
    specializedContainer,
    top5Specialized,
    colorScale,
    "specialized"
  );

  // Add note at the bottom
  leaderboardDiv
    .append("div")
    .text("Hover over entries to highlight in chart")
    .style("font-style", "italic")
    .style("font-size", "11px")
    .style("text-align", "center")
    .style("margin-top", "15px")
    .style("color", "#666");
}

// Helper function to create a leaderboard table
function createLeaderboardTable(
  container,
  combinations,
  colorScale,
  type = "total"
) {
  // Create a table for the leaderboard
  const table = container
    .append("table")
    .style("width", "100%")
    .style("border-collapse", "collapse");

  // Add table header
  const thead = table.append("thead");

  // Different header based on table type
  if (type === "balanced" || type === "specialized") {
    thead.append("tr").html(`
      <th style="text-align: center; padding: 5px; border-bottom: 2px solid #ddd; width: 30px;">Rank</th>
      <th style="text-align: left; padding: 5px; border-bottom: 2px solid #ddd;">Combination</th>
      <th style="text-align: right; padding: 5px; border-bottom: 2px solid #ddd; width: 50px;">Range</th>
    `);
  } else {
    thead.append("tr").html(`
      <th style="text-align: center; padding: 5px; border-bottom: 2px solid #ddd; width: 30px;">Rank</th>
      <th style="text-align: left; padding: 5px; border-bottom: 2px solid #ddd;">Combination</th>
      <th style="text-align: right; padding: 5px; border-bottom: 2px solid #ddd; width: 50px;">Total</th>
    `);
  }

  // Add table body
  const tbody = table.append("tbody");

  // Add rows for each combination
  combinations.forEach((combo, i) => {
    const row = tbody
      .append("tr")
      .style("cursor", "pointer")
      .style("transition", "background-color 0.2s")
      .on("mouseover", function (event) {
        // Highlight the row
        d3.select(this).style("background-color", "rgba(0, 0, 0, 0.05)");

        // Dim all lines in the chart
        d3.selectAll(".line").transition().duration(200).style("opacity", 0);

        // Find the matching line and highlight it
        d3.selectAll(".line")
          .filter(
            (line) =>
              line.Driver === combo.Driver &&
              line.Vehicle === combo.Vehicle &&
              line.Tire === combo.Tire &&
              line.Glider === combo.Glider
          )
          .transition()
          .duration(100)
          .style("opacity", 1)
          .style("stroke-width", 4);
      })
      .on("mouseout", function () {
        // Remove highlight from row
        d3.select(this).style("background-color", "transparent");

        // Reset all lines
        d3.selectAll(".line")
          .transition()
          .duration(200)
          .style("opacity", 0.7)
          .style("stroke-width", 1.8);
      });

    // Add rank cell with colored indicator
    const rankCell = row
      .append("td")
      .style("text-align", "center")
      .style("padding", "5px")
      .style("border-bottom", "1px solid #eee");
    rankCell
      .append("div")
      .text(i + 1)
      .style("display", "inline-block")
      .style("width", "20px")
      .style("height", "20px")
      .style("border-radius", "3px")
      .style("background-color", colorScale(combo.statRange))
      .style("color", "white")
      .style("text-align", "center")
      .style("line-height", "20px")
      .style("font-weight", "bold")
      .style("font-size", "12px");

    // Add combination cell
    row
      .append("td")
      .style("padding", "5px")
      .style("border-bottom", "1px solid #eee").html(`
        <div style="font-weight:bold;">${combo.Driver}</div>
        <div style="font-size:11px;">${combo.Vehicle} / ${combo.Tire} / ${combo.Glider}</div>
      `);

    // Add stat cell - Total or Range based on type
    if (type === "balanced" || type === "specialized") {
      row
        .append("td")
        .text(combo.statRange.toFixed(1))
        .style("text-align", "right")
        .style("padding", "5px")
        .style("border-bottom", "1px solid #eee")
        .style("font-weight", "bold");
    } else {
      row
        .append("td")
        .text(combo.Total)
        .style("text-align", "right")
        .style("padding", "5px")
        .style("border-bottom", "1px solid #eee")
        .style("font-weight", "bold");
    }
  });
}

document.addEventListener("DOMContentLoaded", createGraph);
