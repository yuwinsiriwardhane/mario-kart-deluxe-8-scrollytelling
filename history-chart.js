document.addEventListener('DOMContentLoaded', function () {

    const margin_scatterplot = {top: 10, right: 30, bottom: 30, left: 60},
        width_scatterplot = 580 - margin_scatterplot.left - margin_scatterplot.right,
        height_scatterplot = 400 - margin_scatterplot.top - margin_scatterplot.bottom;

    const svg_scatterplot = d3.select("#svg_scatterplot")
    .append("svg")
        .attr("width", width_scatterplot + margin_scatterplot.left + margin_scatterplot.right)
        .attr("height", height_scatterplot + margin_scatterplot.top + margin_scatterplot.bottom)
    .append("g")
        .attr("transform",
            `translate(${margin_scatterplot.left}, ${margin_scatterplot.top})`);

    d3.csv("mariokart-ratings.csv").then( function(data) {

        kart = data;
        kart.forEach(d => {
            for(var key in d) {
                if(key == 'Year') {
                   
                    d.Year = d3.timeParse('%Y')(d.Year);
                    d.IMDb_Rating = +d.IMDb_Rating;

                }
            }
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

    const tooltip = d3.select("#div_scatterplot")
        .append("div")
        .style("position", "absolute")
        .style("visibility", "hidden")
        .style("opacity", 0)
        .attr("class", "tooltip")
        .style("background-color", "white")
        .style("border", "solid")
        .style("border-width", "1px")
        .style("border-radius", "5px")
        .style("padding", "10px")

    svg_scatterplot.append('g')
        .selectAll("dot")
        .data(kart)
        .enter()
        .append("circle")
        .attr("cx", function (d) { return x_scatterplot(d.Year); } )
        .attr("cy", function (d) { return y_scatterplot(d.IMDb_Rating); } )
        .attr("r", 7)
        .style("fill", "red")
        .style("opacity", 0.3)
        .style("stroke", "white")
        .on("mouseover", function(event, d) {
            tooltip
            .style("opacity", 1)
            .style("visibility", "visible")
    
            d3.select(this)
            .style("stroke", "black")
            .style("opacity", 1)
        } )
        .on("mousemove", function(event, d) {
            const getYear = d3.timeFormat("%Y");
            
            tooltip
            .html(`${d.Title}: ${getYear(d.Year)}`)
            .style("left", (event.pageX + 10) + "px") 
            .style("top", (event.pageY + 10) + "px")
        } )
        .on("mouseleave",  function(event,d) {
            tooltip
            .transition()
            .duration(200)
            .style("opacity", 0)
    
            d3.select(this)
            .style("stroke", "none")
            .style("opacity", 0.3)
        } )

    });

});