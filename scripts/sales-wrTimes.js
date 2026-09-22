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

let barData;

let data1;
let data1json = [];
let allBands1 = [];

let data3;
let salesCombined = 0;

let firstBar = true;
let mergeSalesButton = document.getElementById("mergeSalesButton")

let data2;
let data2Split = [];
let currentLineIndex = 0
let lineDrawData;
let imageLocs = [
    {name : "mariostadium.png"}, {name: "mariocircuit.png"}, {name: "sunshineairport.png"},
    {name: "bonedrydune.png"}, {name: "mutecity.png"}, {name: "bigblue.png"}, {name: "cheeseland.png"},
    {name: "dragondriftway.png"}, {name: "superbell.png"}, {name: "rainbowroad.png"} 
]

let yScaleWrChart;
let xScaleWrChart;

let forwardButton = document.getElementById("forwardButton")

let svgFirstDraw = true;


document.addEventListener('DOMContentLoaded', function () {} )
{
    // on load do data preprocess as well as draw
    Promise.all([d3.csv('./data/sales-all.csv'), d3.csv("./data/track_wr.csv"), d3.csv("./data/sales-combined.csv")])
        .then(function (values) {
            // have data loaded and look at values 
            
            data1 = values[0]
            data2 = values[1]
            data3 = values[2]
            barData = data1

            // sort data
            parseFile()

            // draw data
            svg1 = d3.select("#salesChart")
            svg2 = d3.select("#wrChart")
            barChartDrawInitial()

            parseWRData()
            initialWrTimesDraw()
            updateLineChart()
        });
}

addEventListener("scroll", (event) => {});

onscroll = (event) => {
    let barChart = document.getElementById("salesChart").getBoundingClientRect();

    // console.log(barChart.bottom)
    // console.log("window inner height " + (parseInt(window.innerHeight) - 200))
    // add scrolly events
    if((barChart.bottom <= (parseInt(window.innerHeight) - 100)) && svgFirstDraw)
    {
        barChartDrawBars()
        svgFirstDraw = false
    }
};

function forwardClickWr()
{
    currentLineIndex = currentLineIndex + 1
    if(currentLineIndex >= data2Split.length)
    {
        currentLineIndex = 0
    }
    updateLineChart()
}

function backwardClickWr()
{
    currentLineIndex = currentLineIndex - 1
    if(currentLineIndex <= -1)
    {
        currentLineIndex = data2Split.length - 1
    }
    updateLineChart()
}

function mergeSales()
{
    if(salesCombined == 0)
    {
        salesCombined = 1
        barData = data3
        mergeSalesButton.textContent = "Un-Merge"
    }
    else
    {
        salesCombined = 0
        barData = data1
        mergeSalesButton.textContent = "Merge"
    }
    parseFile()
    barChartDrawBars()
}


function parseFile()
{
    allBands1 = []
    for(let i = 0; i < barData.length; i++)
    {
        allBands1.push(barData[i].Title)
    }
}


function barChartDrawInitial()
{
    // get height and width of svg
    let svgWidth = svg1.style('width').replace('px','');
    let svgHeight = svg1.style('height').replace('px','');

    // amount of pixels from edges of svg 
    let margin = 100;
    let botMargin = 50;

    svg1.style("background-color", "black")
    
    svgWidth = parseInt(svgWidth)
    svgHeight = parseInt(svgHeight)


    // set scales
    let bandScale1 = d3.scaleBand(allBands1, [margin, svgWidth - margin])
        .padding(0.2)

    let maxSales = 0;
    for(let i = 0; i < barData.length; i++)
    {
        if(parseFloat(barData[i].Sales) > maxSales)
        {
            maxSales = parseFloat(barData[i].Sales)
        }
    }

    let yScale = d3.scaleLinear([0, maxSales] ,[svgHeight - botMargin, margin])

    let colorScale = d3.scaleOrdinal()
        .domain(["Gran", "Speed", "Mario"])
        .range(["green", "blue", "red"])

    svg1.append("image")
        .attr("href", function(d) {return "chart_backgrounds/salesBackground2.PNG"})
        .attr("x", 110)
        .attr("y", 80)
        .attr("width", 500)
        .attr("height", 400)

    svg1.append("text")
        .text("Sales (Millions)")
        .style("fill", "#f7eed1")
        .attr("x", -300)
        .attr("y", 50)
        .attr("transform", "translate(0,0)rotate(-90)")
        .attr("font-family", "Lobster, cursive")

    svg1.append("text")
        .text("Sales per Game in Millions")
        .attr("x", 270)
        .attr("y", 80)
        .attr("font-size", "32px")
        .attr("font-family", "Lobster, cursive")
        .style("fill", "#f7eed1")

    // draw scales
    svg1.append("g")
        .style("stroke", "white")
        .style("fill", "white")
        .attr("class", "x-axis")
        .attr("transform", "translate(0," + (svgHeight - botMargin - (margin/2)) + ")")
        .call(d3.axisBottom(bandScale1))
        .selectAll("text")
            .style("fill", "#f7eed1")
            .attr("transform", "translate(-10,0)rotate(-35)")
            .style("text-anchor", "end")
            .attr("font-family", "Lobster, cursive")
    svg1.append("g")
        .style("stroke", "white")
        .style("fill", "white")
        .attr("class", "y-axis")
        .attr("transform", "translate(" + margin + ","  + (-margin/2) + ")    ")
        .call(d3.axisLeft(yScale))
        .selectAll("text")
            .attr("font-size", "18px")

}

function barChartDrawBars()
{

    // get height and width of svg
    let svgWidth = svg1.style('width').replace('px','');
    let svgHeight = svg1.style('height').replace('px','');

    // amount of pixels from edges of svg 
    let margin = 100;
    let botMargin = 50;
    
    svgWidth = parseInt(svgWidth)
    svgHeight = parseInt(svgHeight)


    // set scales
    let bandScale1 = d3.scaleBand(allBands1, [margin, svgWidth - margin])
        .padding(0.2)

    let maxSales = 0;
    for(let i = 0; i < barData.length; i++)
    {
        if(parseFloat(barData[i].Sales) > maxSales)
        {
            maxSales = parseFloat(barData[i].Sales)
        }
    }

    let yScale = d3.scaleLinear([0, maxSales] ,[svgHeight - botMargin, margin])

    let colorScale = d3.scaleOrdinal()
        .domain(["Gran", "Speed", "Mario"])
        .range(["green", "blue", "red"])

    let yFontSize = 15
    let xFontSize = 10
    if(salesCombined == 1)
    {
        yFontSize = 18
        xFontSize = 18
    }
    else
    {
        yFontSize = 15
        xFontSize = 10
    }
    // recall scales
    svg1.selectAll(".y-axis")
        .attr("transform", "translate(" + margin + ","  + (-margin/2) + ")    ")
        .transition()
        .duration(2000)
        .call(d3.axisLeft(yScale))
        .selectAll("text")
            .attr("font-size", (yFontSize + "px"))

    svg1.selectAll(".x-axis")
        .transition()
        .duration(2000)
        .call(d3.axisBottom(bandScale1))
        .selectAll("text")
            .attr("font-size", (xFontSize + "px"))
            .attr("transform", "translate(-10,0)rotate(-35)")
            .style("text-anchor", "end")
            .attr("font-family", "Lobster, cursive")

    // draw bars

    var bars = svg1.selectAll("rect")
        .data(barData)


    
    // had it a differnt way but decided to follow d3 example page instead

    if(firstBar)
    {
        bars.join("rect")
            .attr("x", function(d) {return (bandScale1(d.Title)) })
            .attr("y", function(d) {return (svgHeight - botMargin - (margin/2))})
            .attr("width", bandScale1.bandwidth())
            .attr("fill", function(d) {return colorScale(d.Type)})
            .attr("stroke", "black")
            .transition()
            .duration(750)
            .attr("y", function(d) {return (yScale(d.Sales) - (margin/2))})
            .attr("height", function(d) {return (svgHeight - botMargin - yScale(d.Sales))})
            .delay(function(d,i){return(i*50)})
            firstBar = false
    }
    else
    {
        bars.join("rect")
            .attr("x", function(d) {return (bandScale1(d.Title)) })
            .attr("y", function(d) {return (svgHeight - botMargin - (margin/2))})
            .attr("width", bandScale1.bandwidth())
            .attr("fill", function(d) {return colorScale(d.Type)})
            .attr("stroke", "black")
            .transition()
            .duration(750)
            .attr("y", function(d) {return (yScale(d.Sales) - (margin/2))})
            .attr("height", function(d) {return (svgHeight - botMargin - yScale(d.Sales))})
            .delay(function(d,i){ return(i*50)})
    }

    // bars.join(
    //     enter => enter.append("rect")
    //         .attr("class", "bars")
    //         .attr("x", function(d) {return (bandScale1(d.Title)) })
    //         .attr("y", function(d) {return (svgHeight - botMargin - (margin/2))})
    //         .attr("width", bandScale1.bandwidth())
    //         .attr("fill", function(d) {return colorScale(d.Type)})
    //         .transition()
    //         .duration(750)
    //         .attr("y", function(d) {return (yScale(d.Sales) - (margin/2))})
    //         .attr("height", function(d) {return (svgHeight - botMargin - yScale(d.Sales))})
    //         .delay(function(d,i){console.log(i) ; return(i*100)}),
    //     update => update
    //         .attr("class", "bars")
    //         .attr("x", function(d) {return (bandScale1(d.Title)) })
    //         .attr("y", function(d) {return (svgHeight - botMargin - (margin/2))})
    //         .attr("width", bandScale1.bandwidth())
    //         .attr("fill", function(d) {return colorScale(d.Type)})
    //         .transition()
    //         .duration(750)
    //         .attr("y", function(d) {return (yScale(d.Sales) - (margin/2))})
    //         .attr("height", function(d) {return (svgHeight - botMargin - yScale(d.Sales))})
    //         .delay(function(d,i){console.log(i) ; return(i*100)}),
    //     exit => exit.remove()
    //     )
}

function parseWRData()
{

    
    let currentTrack = ""
    let currentList = [];
    currentList = data2

    for(let i = 0; i < data2.length; i++)
    {
        // change time to float data
        let time = data2[i]["Time"]
        let mins = time.substring(0, 1)
        let secs = time.substring(2, 4)
        let milli = time.substring(5, 8)

        let totalSecs = (parseInt(mins) * 60) + parseInt(secs)
        let parseTime = parseFloat(totalSecs + "." + milli)
        data2[i]["Time"] = parseTime

        // change png data


        if(data2[i]["Track"] != currentTrack)
        {
            // push and then start new list
            data2Split.push(currentList)

            currentList = []
            currentTrack = data2[i]["Track"]
        }
        else
        {
            currentList.push(data2[i])
        }
    }
    data2Split.push(currentList)

    let elemOne = data2Split.shift()
}

// second svg draw
function initialWrTimesDraw()
{
    let svgWidth = svg2.style('width').replace('px','');
    let svgHeight = svg2.style('height').replace('px','');

    
    svg2.style("background-color", "black")

    // amount of pixels from edges of svg 
    let margin = 100;

    // set data to draw
    lineDrawData = data2Split[currentLineIndex]

    // parse data for date and time scales
    let maxTime = 0;
    let minTime = 300;

    // for(let i = 0; i < data2Split.length; i++)
    // {
    //     for(let j = 0; j < data2Split[i].length; j++)
    //     {
    //         console.log(data2Split[i][j]["Time"])
    //         let time = data2Split[i][j]["Time"]
    //         console.log(time)
    //         let mins = time.substring(0, 1)
    //         let secs = time.substring(2, 4)
    //         let milli = time.substring(5, 8)

    //         let totalSecs = (parseInt(mins) * 60) + parseInt(secs)
    //         let parseTime = parseFloat(totalSecs + "." + milli)
    //         data2Split[i][j]["Time"] = parseTime
    //     }
    // }

    for(let i = 0; i < lineDrawData.length; i++)
    {
        
        let parseTime = lineDrawData[i]["Time"]
        
        if(parseTime > maxTime)
        {
            maxTime = parseTime
        }
        if(parseTime < minTime)
        {
            minTime = parseTime
        }
    }
    yScaleWrChart = d3.scaleLinear([minTime, maxTime], [svgHeight, margin])

    let maxDate = new Date("1900-01-01")
    let minDate = new Date("2030-01-01")

    for(let i = 0; i < lineDrawData.length; i++)
    {
        let date = new Date(lineDrawData[i]["Date"])
        // console.log(date)

        if(date.getTime() > maxDate.getTime())
        {
            maxDate = date
        }
        if(date.getTime() < minDate.getTime())
        {
            minDate = date
        }
    }

    xScaleWrChart = d3.scaleTime([minDate, maxDate], [margin, svgWidth - margin])

    // svg2.append("rect")
    //     .attr("x", 0)
    //     .attr("y", 0)
    //     .attr("width", svgWidth)
    //     .attr("height", svgHeight)
    //     .attr("fill", "rgb(235, 198, 52)")
    //     .attr("stroke", "black")
    //     .style("opacity", 0.4)

    svg2.append("image")
        .attr("class", "background")
        .attr("href", function(d) {return "./chart_backgrounds/wrBackground2.PNG"})
        .attr("x", 120)
        .attr("y", 120)
        .attr("width", 400)
        .attr("height", 400)

    svg2.append("g")
        .style("stroke", "white")
        .style("fill", "white")
        .attr("class", "x-axis")
        .attr("transform", "translate(0," + (svgHeight - (margin/2)) + ")")
        .call(d3.axisBottom(xScaleWrChart))
        .selectAll("text")
            .attr("font-size", "18px")
    svg2.append("g")
        .style("stroke", "white")
        .style("fill", "white")
        .attr('class', 'y-axis') 
        .attr("transform", "translate(" + (svgWidth - margin) + ","  + (-margin/2) + ")    ")
        .call(d3.axisRight(yScaleWrChart).ticks(10))
        .selectAll("text")
            .attr("font-size", "18px")


    // draw labels static
    svg2.append("text")
        .attr("font-family", "Comic Sans MS, cursive, sans-serif")
        .attr("x", 540)
        .attr("y", 45)
        .attr("fill", "white")
        .text("Time (seconds)")
}


function updateLineChart()
{
    // initial settings
    let svgWidth = svg2.style('width').replace('px','');
    let svgHeight = svg2.style('height').replace('px','');

    lineDrawData = data2Split[currentLineIndex]
    let margin = 100

    // create x axis
    
    let maxDate = new Date("1900-01-01")
    let minDate = new Date("2030-01-01")

    for(let i = 0; i < lineDrawData.length; i++)
    {
        let date = new Date(lineDrawData[i]["Date"])
        // console.log(date)

        if(date.getTime() > maxDate.getTime())
        {
            maxDate = date
        }
        if(date.getTime() < minDate.getTime())
        {
            minDate = date
        }
    }

    // console.log(minDate + "\n" + maxDate)
    xScaleWrChart.domain([minDate, maxDate])
    svg2.selectAll(".x-axis")
        .transition()
        .duration(2000)
        .call(d3.axisBottom(xScaleWrChart))
        .selectAll("text")
            .attr("font-size", "18px")

    // create y axis
    let maxTime = 0;
    let minTime = 300;

    for(let i = 0; i < lineDrawData.length; i++)
    {
        let parseTime = lineDrawData[i]["Time"]

        if(parseTime > maxTime)
        {
            maxTime = parseTime
        }
        if(parseTime < minTime)
        {
            minTime = parseTime
        }
    }

    yScaleWrChart.domain([minTime, maxTime])
    svg2.selectAll(".y-axis")
        .transition()
        .duration(2000)
        .call(d3.axisRight(yScaleWrChart))
        .selectAll("text")
            .attr("font-size", "18px")
    
    // update the lin
    
    let lineDraw = svg2.selectAll(".line")
        .data([lineDrawData])
        
    let lineDraw2 = svg2.selectAll(".line2")
        .data([lineDrawData])

    let titleDraw = svg2.selectAll(".titleText")
    let pngDraw = svg2.selectAll(".image1")
    let pngBackground = svg2.selectAll(".outline")

    lineDraw.enter()
        .append("path")
        .attr("class", "line")
        .merge(lineDraw)
        .transition()
        .duration(2000)
            .attr("fill", "none")
            .attr("stroke", "white")
            .attr("stroke-width", 5.5)
            .attr("class", "line")
            .attr("d", d3.line()
                .x(function(d) { return xScaleWrChart(new Date(d["Date"])) })
                .y(function(d) { return (yScaleWrChart(d["Time"]) - (margin/2)) })
                )
        
    lineDraw2.enter()
        .append("path")
        .attr("class", "line2")
        .merge(lineDraw2)
        .transition()
        .duration(2000)
            .attr("fill", "none")
            .attr("stroke", "rgb(212, 59, 59)")
            .attr("stroke-width", 4.5)
            .attr("class", "line2")
            .attr("d", d3.line()
                .x(function(d) { return xScaleWrChart(new Date(d["Date"])) })
                .y(function(d) { return (yScaleWrChart(d["Time"]) - (margin/2)) })
                )
      
    // draw into title
    titleDraw
        .data(lineDrawData)
        .join(
            enter => enter.append("text")
                .attr("class", "titleText")
                .attr("x", 300)
                .attr("fill", "white")
                .attr("text-anchor", "middle")
                .attr("font-family", "Comic Sans MS, cursive, sans-serif")
                .attr("font-size", "32px")
                .text(function(d) {return (d["Track"])})
                .transition()
                .duration(1000)
                .attr("y", 100),
            update => update
                .transition()
                .duration(1000)
                .text(function(d) {return (d["Track"])})
                .attrTween("y", function(){
                    return function(t)
                    {
                        return 0 + (t * 100)
                    }
                }),
            exit => exit
                .remove()
    )
    
    // finally draw images
    let name = [imageLocs[currentLineIndex]["name"]]


    pngDraw
        .data(name)
        .join(
            enter => enter.append("image")
                .attr("class", "image1")
                .attr("href", function(d) {return "./track_pngs/" + d})
                .attr("x", 0)
                .attr("y", 120)
                .attr("width", 200)
                .attr("height", 200)
                .attr("stroke", "black")
                .transition()
                .duration(2000)
                .attr("x", 350),
            update => update
                .transition()
                .duration(1000)
                .attr("class", "image1")
                .attr("href", function(d) {return "./track_pngs/" + d})
                .attrTween("x", function() {
                    let origin = 350
                    return function(t) {
                        return (250 + (t* 100))
                    }
                })
                .styleTween("opacity", function() {
                    return function(t) {
                        return t
                    }
                }),
            exit => exit.remove()
        )

    
    // draw title for track and also put in png for track 
}