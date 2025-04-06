// do load and then draw bar chart based off data i collect
// this particular one is top 20 racing games sales by video 

// VIS 1
// desc: bar chart of most popular racing games by sales
// whole point is that mario kart is number 1 and also holds
// a lot of top spots

// url1 nintendo website good: https://www.nintendo.co.jp/ir/en/finance/software/index.html

// VIS 2
// TBD

let svg1;
let svg2;

let data1;

document.addEventListener('DOMContentLoaded', function () {} )
{
    // on load do data preprocess as well as draw
    Promise.all([d3.csv('data1.csv')])
        .then(function (values) {
            // have data loaded and look at values 
            console.log(values)

            data1 = values
            svg1 = d3.select("#svg1")
            barChartDraw()
        });
}

function barChartDraw()
{
    // svg1.append("circle")
    //     .attr("cx", 50)
    //     .attr("cy", 50)
    //     .attr("r", 50)

    // make color scale
    const scaleSoldCopies = d3.scaleOrdinal()
        .domain(["Mario", "Turismo", "Speed"])
        .range(["red", "green", "blue"])

    // make x axis scale

    // make y axis scale

    console.log(data1[0])
    svg1.selectAll("bars")
        .data(data1[0])
        .join(
            enter => enter.append("rect")
                .attr("x", 10)
                .attr("y", 10)
                .attr("width", 10)
                .attr("height", 50)
                .attr("fill", "black")
                .transition(),
            update => update
                .style("opacity", .4)
                .transition()
                .duration(300)
                .attr("fill", function(d) { return blueColor(d.color)}),
            exit => exit
        )

}