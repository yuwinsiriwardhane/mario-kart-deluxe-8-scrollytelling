// itemDistribution.js
// made by Luke Dujmic

//The names that Nintendo gives for the items are on the right
const displayNames = {
  Banana:       "Banana",
  GreenShell:   "Green Shell",
  RedShell:     "Red Shell",
  Mushroom:     "Mushroom",
  Bomb:         "Bob-omb",
  Blooper:      "Blooper",
  BlueShell:    "Spiny Shell",
  TripleShroom: "Triple Mushrooms",
  Star:         "Super Star",
  Bullet:       "Bullet Bill",
  Shock:        "Lightning",
  QueenShroom:  "Golden Mushroom",
  Flower:       "Fire Flower",
  Plant:        "Piranha Plant",
  Boomerang:    "Boomerang Flower",
  Coin:         "Coin",
  Boombox:      "Super Horn",
  TripleBanana: "Triple Bananas",
  TripleGreen:  "Triple Green Shells",
  TripleRed:    "Triple Red Shells",
  CrazyEight:   "Crazy Eight",
  Boo:          "Boo"
};
const itemKeys = Object.keys(displayNames);

//these are the CSV files based on placement categories
const placementFiles = {
  "1st":      "data/MK_Items1.csv",
  "2nd":      "data/MK_Items2.csv",
  "3rd-5th":  "data/MK_Items3.csv",
  "6th-8th":  "data/MK_Items4.csv",
  "9th-12th": "data/MK_Items5.csv"
};

//variables for things like spacing that I use later to not disturb raw values
const iconSize       = 32;
const smallThreshold = 3;
const innerFactor    = 0.6;
const outerFactor    = 1.15;
const extraPadding   = 60;

//this is how big the pie chart is plus additional padding
const baseSize = 800;
const idWidth    = baseSize + 100;
const idHeight   = baseSize + 100;
const idRadius   = baseSize/2 - iconSize*outerFactor - extraPadding;

const svg = d3.select("#visualization")
  .append("svg")
    .attr("width",  idWidth)
    .attr("height", idHeight)
    .style("display","block")
    .style("margin","auto");

const defs = svg.append("defs");
const filter = defs.append("filter")
  .attr("id","drop-shadow")
  .attr("height","130%");
filter.append("feGaussianBlur")
  .attr("in","SourceAlpha")
  .attr("stdDeviation","4")
  .attr("result","blur");
filter.append("feOffset")
  .attr("in","blur")
  .attr("dx","2")
  .attr("dy","2")
  .attr("result","offsetBlur");
const feMerge = filter.append("feMerge");
feMerge.append("feMergeNode").attr("in","offsetBlur");
feMerge.append("feMergeNode").attr("in","SourceGraphic");

const g = svg.append("g")
  .attr("transform", `translate(${idWidth/2},${idHeight/2})`)
  .attr("filter","url(#drop-shadow)");

  //special colors I chose for each item
const color = d3.scaleOrdinal()
  .domain(itemKeys)
  .range([
    "#feffb0","#a4ff7a","#ffcec4","#ff7598",
    "#1a135e","#a290b0","#6d66ed","#d6456e",
    "#ffa6fb","#272729","#fbffb0","#ffe045",
    "#ffac5e","#6eeb60","#5ae1e8","#f7eb60",
    "#ff3358","#faff6b","#4eb320","#ff6445",
    "#cc40ff","#ededed"
  ]);

//Here is where the pie chart is made
//the "area" will included all the controls and whatnot
const root = d3.select(".pieChartArea").style("display","block");

const row = root.append("div")
  .style("display","flex")
  .style("align-items","flex-start");

// left: chart + controls
const leftCell = row.append("div")
    .attr("id","chartContainer")   // <-- add this
    .style("flex","1")
    .style("text-align","center");

  leftCell.node().appendChild(document.getElementById("visualization"));

  //add the controls to this div in the visualization ID
const controls = leftCell.append("div")
  .attr("class","d-flex justify-content-center align-items-center my-3");
controls.append("label")
    .attr("for","placementSelect")
    .style("margin-right","8px")
    .text("Placement:");
controls.append("select")
    .attr("id","placementSelect")
    .classed("form-select me-4", true);
controls.append("label")
    .attr("for","distanceSlider")
    .style("margin-right","8px")
    .text("Distance:");
controls.append("input")
    .attr("type","range")
    .attr("id","distanceSlider")
    .classed("form-range me-2", true);
controls.append("span")
    .attr("id","distanceLabel")
    .style("min-width","3em");

// right: info panel
const infoPanel = row.append("div")
  .attr("id","infoPanel")
  .style("flex","0 0 200px")
  .style("margin-left","20px")
  .style("height", `${idHeight}px`)
  .style("overflow","auto")
  .style("display","flex")
  .style("align-items","center")
  .style("justify-content","center")
  .html("<em>Click a slice or icon for details</em>");

const placementSel  = d3.select("#placementSelect");
const distanceRng   = d3.select("#distanceSlider");
const distanceLabel = d3.select("#distanceLabel");

//this is the name tag stuff
//bullet bill and bomb have white text
function showInfo(datum) {
  const bgColor   = color(datum.item);
  const name      = displayNames[datum.item];
  const pct       = datum.percentage;
  const isDarkBg  = datum.item === "Bullet" || datum.item === "Bomb";
  const textColor = isDarkBg ? "white" : "black";

  // Just decided to add this as html directly
  infoPanel.html(`
    <div style="
      width:160px;
      border-radius:8px;
      box-shadow:0 2px 6px rgba(0,0,0,0.15);
      overflow:hidden;
      font-family:sans-serif;
      text-align:center;
    ">
      <div style="background:${bgColor};padding:12px;">
        <img src="images/itemIcons/${datum.item}.png" style="width:48px;height:48px;"/>
      </div>
      <div style="background:white;padding:8px;font-size:1rem;">
        <strong>${name}</strong>
      </div>
      <div style="background:${bgColor};padding:8px;color:${textColor};font-size:0.9rem;">
        Chance: ${pct}%  
      </div>
    </div>
  `);
}

// Load the CSV files, there are 5 separate ones 
Promise.all(
  Object.entries(placementFiles).map(([pl,path]) =>
    d3.csv(path).then(rows => {
      const parsed = rows.map(r => ({
        distance: r["distance(units)"],
        items: itemKeys
        //remove stupid characters and whatnot
          .map(key => {
            const raw = (r[key]||"0").trim().replace(/%$/,"");
            return { item:key, percentage:parseFloat(raw)||0 };
          })
          .filter(d=>d.percentage>0)
      }));
      return [pl, parsed];
    }))
).then(pairs => {
  const nested = new Map();
  pairs.forEach(([pl,arr]) => {
    nested.set(pl, new Map(arr.map(r=>[r.distance, r.items])));
  });

  const placements = Array.from(nested.keys());
  let currentDistances = [];

  function configureSlider(pl) {
    const prev = +distanceRng.property("value");
    currentDistances = Array.from(nested.get(pl).keys())
                            .sort((a,b)=>+a - +b);
    distanceRng
      .attr("min", 0)
      .attr("max", currentDistances.length - 1)
      .attr("step", 1);

    let idx = prev;
    if (currentDistances.length === 1 || prev > currentDistances.length-1) {
      idx = 0;
    }
    distanceRng.property("value", idx);
    distanceLabel.text(currentDistances[idx]);
    distanceRng.property("disabled", currentDistances.length===1)
               .classed("disabled", currentDistances.length===1);
  }

  function redraw() {
    const pl   = placementSel.property("value");
    const idx  = +distanceRng.property("value");
    const dist = currentDistances[idx];
    distanceLabel.text(dist);

    const data = nested.get(pl).get(dist);
    const pie  = d3.pie().value(d=>d.percentage).sort(null);
    const arcs = pie(data);
    const arcG = d3.arc().innerRadius(0).outerRadius(idRadius);

    // slices
    const paths = g.selectAll("path").data(arcs, d=>d.data.item);
    paths.join(
      enter => enter.append("path")
        .attr("fill",d=>color(d.data.item))
        .attr("stroke","white")
        .attr("stroke-width","1px")
        .each(function(d){ this._current=d; })
        .attr("d",arcG)
        .on("click",(e,d)=>showInfo(d.data)),
      update => update.on("click",(e,d)=>showInfo(d.data)),
      exit => exit.remove()
    )
    .transition().duration(600)
      .attrTween("d",function(d){
        const i = d3.interpolate(this._current,d);
        this._current = i(1);
        return t=>arcG(i(t));
      });

    // icons
    const icons = g.selectAll("image.slice-icon").data(arcs, d=>d.data.item);
    icons.join(
      enter => enter.append("image")
        .attr("class","slice-icon")
        .attr("width",iconSize)
        .attr("height",iconSize)
        .attr("href",d=>`images/itemIcons/${d.data.item}.png`)
        .attr("opacity",1)
        .attr("x",-iconSize/2)
        .attr("y",-iconSize/2)
        .on("click",(e,d)=>showInfo(d.data))
      .transition().duration(600)
        .attr("x", d=>{
          const [cx,cy] = arcG.centroid(d);
          const f = d.data.percentage<smallThreshold ? outerFactor : innerFactor;
          return cx*(2*f)-iconSize/2;
        })
        .attr("y", d=>{
          const [cx,cy] = arcG.centroid(d);
          const f = d.data.percentage<smallThreshold ? outerFactor : innerFactor;
          return cy*(2*f)-iconSize/2;
        }),
      update => update
        .attr("opacity",1)
        .on("click",(e,d)=>showInfo(d.data))
      .transition().duration(600)
        .attr("x", d=>{
          const [cx,cy] = arcG.centroid(d);
          const f = d.data.percentage<smallThreshold ? outerFactor : innerFactor;
          return cx*(2*f)-iconSize/2;
        })
        .attr("y", d=>{
          const [cx,cy] = arcG.centroid(d);
          const f = d.data.percentage<smallThreshold ? outerFactor : innerFactor;
          return cy*(2*f)-iconSize/2;
        }),
      exit => exit.remove()
    );
  }

  // populate & hook controls
  placementSel
    .selectAll("option")
    .data(placements)
    .join("option")
      .attr("value", d=>d)
      .text(d=>d);

  //when you change placement categories redraw the pie chart
  placementSel.on("change", ()=>{
    configureSlider(placementSel.property("value"));
    redraw();
  });
  distanceRng.on("input change", redraw);

  configureSlider(placements[0]);
  redraw();

});
