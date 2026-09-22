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

var color = d3.scaleOrdinal
                            //(d3.schemeCategory10);

                            (["Light", "Medium", "Heavy", "Customizable",
                             "Baby Characters","Mushroom Kingdom", "Koopalings", "Animal Crossing", "Splatoon", "Spooky Characters", "Mii",
                             "Baby Mario", "Baby Luigi", "Baby Peach", "Toad", "Baby Daisy", "Toadette",
                             "Baby Rosalina", "Koopa Troopa" , "Shy Guy", "Lakitu", "Bowser Jr.", "Lemmy",
                             "Dry Bones", "Larry", "Wendy", "Isabelle", "Mario", "Luigi", "Peach", "Daisy",
                             "Yoshi", "Tanooki Mario", "Iggy", "Cat Peach", "Lugwig", "Villager (Boy)", "Villager (Girl)",
                             "Bowser", "Donkey Kong", "Wario", "Waluigi", "Rosalina", "Metal Mario", "Pink Gold Peach", "King Boo",
                             "Dry Bowser", "Roy", "Morton", "Link", "Mii", "Inkling Girl", "Inkling Boy"],
                             ["#ADD8E6", "#0000CD", "#000098", "#000060",
                              "#89CFF0", "#90EE90", "#FFFF00", "red", "purple", "orange", "grey",
                              "#e03038", "#41a732", "#fec6f3",  "#F4260F", "#ffe833", "#FF69B4",
                              "#6EADBF", "#55da66", "#E10B11", "#00bfff", "#cfce37", "#ff69b4",
                              "#e6d8b5", "#87Ceeb", "#ffa7d1", "#ffd700", "red", "green", "#fec6f3", "#f86a2e",
                              "#68d154", "#ae6c37", "#A2FF6B", "#ffa8c2", "#9370db", "#00Ff7f", "#ff69b4",
                              "#32765c", "#b34200", "#fecb4c", "#9D4CEC", "#89e0d5", "#A0A0A0", "#Ffb6c1",
                              "#555555", "#ff4500", "#8b4513",  "#bed163", "#5cc1e6", "#f02d7d", "#19d719"]);

var sankey = d3.sankey()
    .nodeWidth(36)
    .nodePadding(10)
    .size([width, height]);

d3.json("../data/weight-class.json").then( function(sankeydata) {
    
  const graph = sankey(sankeydata);

  var link = svg.append("g")
    .selectAll(".link")
    .data(graph.links)
    .enter()
    .append("path")
      .attr("class", "link")
      .attr("d", d3.sankeyLinkHorizontal() )
      .style("stroke-width", function(d) { return  d.width; })
      .style("stroke", "#404040")
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
        .style("fill", "#F7EED1")
        .filter(function(d) { return d.x0 < width / 2; })
        .attr("x", function(d) { return d.x1 + 6; })
        .attr("text-anchor", "start");
        

});

});