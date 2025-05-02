// hiddenStats.js
// file by: Luke Dujmic

//svg size portions
const hsWidth = 700;
const hsHeight = 700;
const hsMargin = 100;
const hsRadius = Math.min(hsWidth / 2, hsHeight / 2) - hsMargin;

// the stats used from the csv file
const statMap = {
  OF: 'Off-road Traction',
  MT: 'Mini Turbo',
  SA: 'Air Speed',
  TA: 'Air Acceleration',
  IV: 'Invincibility'
};
const statKeys = Object.keys(statMap);
let statMaxValues = {};

//create the visualization
const hsSvg = d3.select("#hiddenStatVis")
  .append("svg")
  .attr("width", hsWidth)
  .attr("height", hsHeight)
  .append("g")
  .attr("transform", `translate(${hsWidth / 2}, ${hsHeight / 2})`);

const angleSlice = (Math.PI * 2) / statKeys.length;

//the d3 radar function is used for the spider chart
function drawRadarGrid(levels = 5) {
  for (let level = 0; level < levels; level++) {
    const r = hsRadius * ((level + 1) / levels);
    hsSvg.append("polygon")
      .attr("points", statKeys.map((d, i) => {
        const angle = angleSlice * i;
        const x = r * Math.cos(angle - Math.PI / 2);
        const y = r * Math.sin(angle - Math.PI / 2);
        //console.log(angle)
        return `${x},${y}`;
      }).join(" "))
      .attr("fill", "none")
      .attr("stroke", "#ccc");
  }

  //for every stat add a name and its text position
  statKeys.forEach((key, i) => {
    const angle = angleSlice * i;
    const x = (hsRadius + 40) * Math.cos(angle - Math.PI / 2);
    const y = (hsRadius + 40) * Math.sin(angle - Math.PI / 2);
    hsSvg.append("line")
      .attr("x1", 0).attr("y1", 0)
      .attr("x2", x).attr("y2", y)
      .attr("stroke", "#999");

    hsSvg.append("text")
      .attr("x", x)
      .attr("y", y)
      .attr("text-anchor", "middle")
      .style("font-size", "14px")
      //the name of the stat
      .text(statMap[key]);
  });
}

//here we draw the actual stat values
function drawRadar(data) {
  const points = statKeys.map((key, i) => {
    const val = data[key];
    const angle = angleSlice * i;
    //since the stats in Mario Kart have different max values, make sure to scale to their max values so the chart looks even
    //basically make it so max of 5 MINI TURBO goes to the end of the diagram the same way a max of 10 AIR ACCELERATION does
    const r = (val / statMaxValues[key]) * hsRadius;
    const x = r * Math.cos(angle - Math.PI / 2);
    const y = r * Math.sin(angle - Math.PI / 2);
    return [x, y];
  });

  //the line connecting each stat
  const radarLine = d3.line().curve(d3.curveLinearClosed);

  // color the diagram a blue color
  let radarPath = hsSvg.selectAll(".radarArea").data([points]);
  radarPath.join(
    enter => enter.append("path")
      .attr("class", "radarArea")
      .attr("fill", "rgba(0, 128, 255, 0.4)")
      .attr("stroke", "blue")
      .attr("d", radarLine)
      .style("opacity", 0)
      .transition().duration(600).style("opacity", 1),
    update => update.transition().duration(600).attr("d", radarLine)
  );

  // draw dots at each tip cuz characters like bowser have zeroes in several stats making it hard to see stat values without it
  const tipDots = hsSvg.selectAll(".statTip").data(points);
  tipDots.join(
    enter => enter.append("circle")
      .attr("class", "statTip")
      .attr("r", 4)
      .attr("fill", "blue")
      .attr("cx", d => d[0])
      .attr("cy", d => d[1]),
    update => update.transition().duration(600)
      .attr("cx", d => d[0])
      .attr("cy", d => d[1])
  );

  d3.select("#charCardImg").attr("src", `characterIcons/${data.Driver}.png`);
  d3.select("#charCardName").text(data.Driver);
}

//this is for creating the character selection menu
// STILL NEEDS STYLING TWEAKS
function createCharacterGrid(data) {
  const table = d3.select("#charTable");
  const columns = 8;
  let selectedCell = null;

  // this is where the table is drawn
  //it will be appended to the empty table in the html file
  const rows = Math.ceil(data.length / columns);
  // 2d for loop is needed to make each row and then the individual cells
  // just like in Mario Kart, there are 8 characters per row before moving on to another
  for (let i = 0; i < rows; i++) {
    const row = table.append("tr");
    for (let j = 0; j < columns; j++) {
      const index = i * columns + j;
      if (index < data.length) {
        const td = row.append("td")
          .style("padding", "4px")
          .style("cursor", "pointer")
          .style("border", "none")
          //these minimum dimensions ensure that the boxes have consistent size despite the images having different dimensions
          .style("min-width", "40px")
          .style("min-height", "40px")
          .style("textAlign", "center")
          .on("click", function () {
            if (selectedCell) selectedCell.style("background", null);
            selectedCell = d3.select(this);
            selectedCell.style("background", "#cce6ff");
            drawRadar(data[index]);
          });

        td.append("img")
          .attr("src", `characterIcons/${data[index].Driver}.png`)
          .attr("alt", data[index].Driver)
          //max size also ensures consistency
          .style("max-width", "100px")
          .style("max-height", "100px")
          .style("objectFit", "contain")
          .style("display", "block")
          .style("margin", "0 auto");
      }
    }
  }
}

// load the data and make it append to the stat values used for the spider chart
function loadData() {
  d3.csv("data/MK_Stats.csv").then(data => {
    data.forEach(d => {
      //get names here
      statKeys.forEach(k => d[k] = +d[k]);
    });

    // Compute max values per stat
    statKeys.forEach(key => {
      statMaxValues[key] = d3.max(data, d => d[key]);
    });

    createCharacterGrid(data);
    drawRadarGrid();
  });
}

loadData();
