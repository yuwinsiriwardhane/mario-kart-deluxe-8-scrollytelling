document.addEventListener('DOMContentLoaded', function () {

var margin = {top: 10, right: 10, bottom: 10, left: 10},
    width = 1400 - margin.left - margin.right,
    height = 1000 - margin.top - margin.bottom;

var svg = d3.select("#svg_sankey").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

var color = d3.scaleOrdinal(d3.schemeCategory10);
                            // (["Light", "Medium", "Heavy", "Customizable",
                            //  "Mushroom Kingdom", "Koopalings", "Animal Crossing", "Splatoon", "Spooky Characters", "Mii",
                            //  "Baby Mario", "Baby Luigi", "Baby Peach", "Toad", "Baby Daisy", "Toadette",
                            //  "Baby Rosalina", "Koopa Troopa" , "Shy Guy", "Lakitu", "Bowser Jr.", "Lemmy",
                            //  "Dry Bones", "Larry", "Wendy", "Isabelle", "Mario", "Luigi", "Peach", "Daisy",
                            //  "Yoshi", "Tanooki Mario", "Iggy", "Cat Peach", "Lugwig", "Inkling (Boy)", "Inkling (Girl)",
                            //  "Bowser", "Donkey Kong", "Wario", "Waluigi", "Rosalina", "Metal Mario", "Pink Gold Peach", "King Boo",
                            //  "Dry Bowser", "Roy", "Morton", "Link", "Mii"],
                            //  ["red", "green", "blue"]);

var sankey = d3.sankey()
    .nodeWidth(36)
    .nodePadding(10)
    .size([width, height]);

d3.json("weight-class.json").then( function(sankeydata) {
    
  const graph = sankey(sankeydata);

  var link = svg.append("g")
    .selectAll(".link")
    .data(graph.links)
    .enter()
    .append("path")
      .attr("class", "link")
      .attr("d", d3.sankeyLinkHorizontal() )
      .style("stroke-width", function(d) { return  d.width; })
      .style("stroke", "#D3D3D3")
      .style("fill", "none");

  var node = svg.append("g")
    .selectAll(".node")
    .data(graph.nodes)
    .enter().append("g")
      .attr("class", "node")

  node.append("rect")
        .attr("x", function(d) { return d.x0; })
        .attr("y", function(d) { return d.y0; })
        .attr("height", function(d) { return d.y1 - d.y0; })
        .attr("width", sankey.nodeWidth())
        .style("fill", function(d) { 
                //console.log(d.name.replace(/ .*/, ""));
                return d.color = color(d.name); })
        .style("stroke", function(d) { 
            return d3.rgb(d.color).darker(2); })
        .append("title")
        .text(function(d) { 
            return d.name + "\n"});

  node.append("text")
        .attr("x", function(d) { return d.x0 - 6; })
        .attr("y", function(d) { return (d.y1 + d.y0) / 2; })
        .attr("dy", "0.35em")
        .attr("text-anchor", "end")
        .text(function(d) { return d.name; })
        .filter(function(d) { return d.x0 < width / 2; })
        .attr("x", function(d) { return d.x1 + 6; })
        .attr("text-anchor", "start");

});

});