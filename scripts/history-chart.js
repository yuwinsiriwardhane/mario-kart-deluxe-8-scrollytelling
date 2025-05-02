document.addEventListener('DOMContentLoaded', function () {

    const margin_scatterplot = {top: 10, right: 30, bottom: 50, left: 60},
        width_scatterplot = 980 - margin_scatterplot.left - margin_scatterplot.right,
        height_scatterplot = 700 - margin_scatterplot.top - margin_scatterplot.bottom;

    const svg_scatterplot = d3.select("#svg_scatterplot")
    .style("background-color", "black")
    .style("color", "#f7eed1")
    .append("svg")
        .attr("width", width_scatterplot + margin_scatterplot.left + margin_scatterplot.right)
        .attr("height", height_scatterplot + margin_scatterplot.top + margin_scatterplot.bottom)
    .append("g")
        .attr("transform",
            `translate(${margin_scatterplot.left}, ${margin_scatterplot.top})`);

    d3.csv("data/mariokart-ratings.csv").then( function(data) {

        kart = data;
        kart.forEach(d => {
            for(var key in d) {
                if(key == 'Year') {
                   
                    d.Year = d3.timeParse('%Y')(d.Year);
                    d.IMDb_Rating = +d.IMDb_Rating;

                }
            }
            d.isMarioKart = d.Title.includes("Mario Kart");

        });

    const x_scatterplot = d3.scaleTime()
        .range([ 0, width_scatterplot ]);

        var minYear_scatterplot = d3.timeParse('%Y')('1981'); 
        var maxYear_scatterplot = d3.timeParse('%Y')('2024'); 

        //console.log(minYear, maxYear);
        x_scatterplot.domain([minYear_scatterplot, maxYear_scatterplot]);

    svg_scatterplot.append("g")
        .attr("transform", `translate(0, ${height_scatterplot})`)
        .call(d3.axisBottom(x_scatterplot));

    const y_scatterplot = d3.scaleLinear()
        .domain([0, 10])
        .range([ height_scatterplot, 0]);
    svg_scatterplot.append("g")
        .call(d3.axisLeft(y_scatterplot));

    svg_scatterplot.append("text")
        .attr("class", "x-label")
        .attr("x", width_scatterplot / 2 + 40)
        .attr("y", height_scatterplot + margin_scatterplot.bottom)
        .attr("text-anchor", "end")
        .style("fill", "#f7eed1")
        .text("Release Year")
        
    svg_scatterplot.append("text")
        .attr("class", "y-label")
        .attr("transform", "rotate(-90)")
        .attr("x", -height_scatterplot / 2 + 50)
        .attr("y", -30)
        .attr("text-anchor", "end")
        .style("fill", "#f7eed1")
        .text("Game Rating");

    const tooltip = d3.select("#div_scatterplot")
        .append("div")
        .style("position", "absolute")
        .style("visibility", "hidden")
        .style("opacity", 0)
        .attr("class", "tooltip")
        .style("background-color", "black")
        .style("border", "solid")
        .style("border-width", "1px")
        .style("border-radius", "5px")
        .style("padding", "10px")
        .style("color", "white")

    const starSymbol = d3.symbol()
        .type(d3.symbolStar)
        .size(100);

    svg_scatterplot.append('g')
        .selectAll("dot")
        .data(kart.filter(d => !d.isMarioKart))
        .enter()
        .append("circle")
        .attr("cx", function (d) { return x_scatterplot(d.Year); } )
        .attr("cy", function (d) { return y_scatterplot(d.IMDb_Rating); } )
        .attr("r", 7)
        .style("fill", "red")
        .style("opacity", 0.4)
        .style("stroke", "white")
        .on("mouseover", function(event, d) {
            tooltip
            .style("opacity", 1)
            .style("visibility", "visible")
    
            d3.select(this)
            .style("stroke", "white")
            .style("opacity", 1)
        })
        .on("mousemove", function(event, d) {
            const getYear = d3.timeFormat("%Y");
            
            tooltip
            .html(`${d.Title}: ${getYear(d.Year)}`)
            .style("left", (event.pageX + 10) + "px") 
            .style("top", (event.pageY + 10) + "px")
        })
        .on("mouseleave",  function(event,d) {
            tooltip
            .transition()
            .duration(200)
            .style("opacity", 0)
    
            d3.select(this)
            .style("stroke", "white")
            .style("opacity", 0.3)
        });

        svg_scatterplot.append('g')
        .selectAll("star")
        .data(kart.filter(d => d.isMarioKart))
        .enter()
        .append("path")
        .attr("d",starSymbol)
        .attr("transform", d => `translate(${x_scatterplot(d.Year)},${y_scatterplot(d.IMDb_Rating)})`)
        .style("fill", "gold")
        .style("opacity", 0.6)
        .style("stroke", "white")
        .on("mouseover", function(event, d) {
            tooltip
            .style("opacity", 1)
            .style("visibility", "visible")
    
            d3.select(this)
            .style("stroke", "white")
            .style("opacity", 1)
        })
        .on("mousemove", function(event, d) {
            const getYear = d3.timeFormat("%Y");
            
            tooltip
            .html(`${d.Title}: ${getYear(d.Year)}`)
            .style("left", (event.pageX + 10) + "px") 
            .style("top", (event.pageY + 10) + "px")
        })
        .on("mouseleave",  function() {
            tooltip
            .transition()
            .duration(200)
            .style("opacity", 0)
    
            d3.select(this)
            .style("stroke", "white")
            .style("opacity", 0.6)
        });

        const legend = svg_scatterplot.append("g")
        .attr("class", "legend")
            .append("rect")
            .attr("x",625)
            .attr("y",515)
            .attr("width", 225)
            .attr("height", 60)
            .style("fill", "rgb(71, 71, 71)")
            .style('stroke', 'white')
            .style('stroke-width', 1.5)


            svg_scatterplot.append("circle")
            .attr("cx",650)
            .attr("cy",558)
            .attr("r", 7)
            .style("fill", "red")
            .style('stroke', 'white')


            svg_scatterplot.append("path")
            .attr("d", starSymbol)
            .attr("transform", "translate(650,530)")
            .style("fill", "gold")
            .style('stroke', 'white')

            svg_scatterplot.append("text")
            .attr("x", 670)
            .attr("y", 530)
            .text("Mario Kart Game")
            .style("font-size", "15px")
            .style('fill', '#f7eed1')
            .attr("alignment-baseline","middle")

            svg_scatterplot.append("text")
            .attr("x", 670)
            .attr("y", 560)
            .text("Other Game")
            .style("font-size", "15px")
            .style('fill', '#f7eed1')
            .attr("alignment-baseline","middle");

    });

});