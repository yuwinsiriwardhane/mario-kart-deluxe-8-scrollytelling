var kartDataset = [];
var mainStats = ["Weight", "Acceleration", "Ground Speed", "Ground Handling", "On Road Traction"]

var selectedKart = null;
var kartStatsSvg = null;
var selectedKartElement = null;
var xScale = null;
var yScale = null;
var xAxis = null;
var yAxis = null;


document.addEventListener("DOMContentLoaded", () => {
    importKartDataset();
    drawKartScales();
    drawKartIntitalBackgroundRects();
});

const drawKartScales = () => {
    kartStatsSvg = d3.select(".ysiriwar_kart_stats_svg").attr("width", "1000px").attr("height", "900px");

    xScale = d3.scaleLinear().domain([0, 11]).range([10, 650]);
    yScale = d3.scaleBand().domain(mainStats.map(d => d)).range([0, 800]).padding(0.2);

    xAxis = d3.axisBottom(xScale).tickSize(8).tickPadding(20).tickFormat((d) => {
        return d === 11 ? "⭐️" : d;
    });

    yAxis = d3.axisRight(yScale).tickSize(8).tickPadding(20);

    kartStatsSvg.append("g").attr("transform", `translate(250, 800)`).call(xAxis);
    kartStatsSvg.append("g").attr("transform", `translate(-10, 0)`).call(yAxis);
}

const drawKartIntitalBackgroundRects = () => {
    kartStatsSvg.append("defs")
        .append("linearGradient")
        .attr("id", "bar-gradient")
        .attr("x1", "0%")
        .attr("y1", "0%")
        .attr("x2", "100%")
        .attr("y2", "0%")
        .selectAll("stop")
        .data([
            { offset: "25%", color: "#b50100" },
            { offset: "75%", color: "#f2ce08" },
        ])
        .enter()
        .append("stop")
        .attr("offset", d => d.offset)
        .attr("stop-color", d => d.color);

    kartStatsSvg.append("g")
        .selectAll(".ysiriwar_background_rect")
        .data(mainStats)
        .join(
            (enter) =>
                enter
                    .append("rect")
                    .attr("class", "ysiriwar_background_rect")
                    .attr("x", 0)
                    .attr("y", (d) => {
                        return yScale(d)
                    })
                    .attr("height", 55)
                    .attr("width", 0)
                    .attr("fill", "black")
                    .attr("stroke", "white")
                    .attr("rx", 15)
                    .attr("ry", 95)
                    .style("opacity", "0")
                    .attr("transform", "translate(250, 30)")
                    .call((selection) => {
                        selection.transition()
                            .duration(800)
                            .delay(200)
                            .attr("width", 650)
                            .style("opacity", "0.8")
                    }),
            (update) => update,
            (exit) => exit
        )

    mainStats.forEach((d, i) => {
        kartStatsSvg.append("g")
            .selectAll(".seperators")
            .data([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
            .join(
                (enter) =>
                    enter.append("line")
                        .attr("class", "seperators")
                        .attr("x1", (d) => xScale(d))
                        .attr("x2", (d) => xScale(d))
                        .attr("y1", yScale(d))
                        .attr("y2", yScale(d) + 55)
                        .attr("stroke", "white")
                        .attr("stroke-width", 2)
                        .attr("transform", "translate(252, 30)")
                        .style("opacity", "0")
                        .call((selection) => {
                            selection.transition()
                                .duration(800)
                                .delay(200)
                                .style("opacity", "0.3")
                        }),
                (update) => update,
                (exit) => exit
            )
    })
}

const drawKartHorizontalChart = () => {
    kartStatsSvg.selectAll(".bar").transition().duration(1000).attr("width", 0).style("opacity", "0").remove();

    let newKartObjArray = formatKartObjForStatsChart();
    console.log("newKartObjArray", newKartObjArray);


    kartStatsSvg.append("g")
        .selectAll(".bar")
        .data(newKartObjArray)
        .join(
            (enter) =>
                enter
                    .append("rect")
                    .attr("class", "bar")
                    .attr("x", 0)
                    .attr("y", (d) => {
                        return yScale(d.name)
                    })
                    .attr("height", 55)
                    .attr("width", 0)
                    .attr("rx", 15)
                    .attr("ry", 95)
                    .attr("fill", "url(#bar-gradient)")
                    .attr("transform", "translate(250, 30)")
                    .style("opacity", "0")
                    .call((selection) => {
                        selection.transition()
                            .duration(800)
                            .delay(400)
                            .attr("width", (d) => {
                                return d.value === "0" ? 0 : xScale(+d.value)
                            })
                            .style("opacity", "0.8")
                    }),
            (update) => update,
            (exit) => exit
        )
}

const importKartDataset = () => {
    d3.csv("/data/MK8_Kart_Stats.csv").then(data => {
        console.log("kartDataset => ", data);
        kartDataset = wrangleKartDataset(data);
        populateKartImages();
    });
}

const wrangleKartDataset = (dataset) => {
    kartDataset = dataset.map((item) => {
        let newObj = {
            "image": `/images/karts/${item["Body"].split(" ").join("")}.webp`,
            "kart": item["Body"],
            "acceleration": item["Acceleration"],
            "groundSpeed": item["Ground Speed"],
            "groundHandling": item["Ground Handling"],
            "weight": item["Weight"],
            "onRoadTraction": item["On Road Traction"]
        }

        return newObj;
    });

    console.log("wrangleKartDataset => ", kartDataset);
    return kartDataset;
}

const populateKartImages = () => {
    let kartContainer = d3.select(".ysiriwar_kart_container");

    kartContainer.selectAll("img")
        .data(kartDataset)
        .join(
            (enter) =>
                enter
                    .append("img")
                    .attr("class", "ysiriwar_kart_img")
                    .attr("id", (d) => {
                        let formatName = d.kart.split(" ").join("")
                        return formatName;
                    })
                    .attr("src", (d) => d.image)
                    .style("width", "90px")
                    .style("height", "80px")
                    .style("opacity", "0")
                    .call(selection => {
                        selection.transition().duration(1000).style("opacity", "1")
                    }),
            (update) => update,
            (exit) => exit
        )
        .on("click", (event, d) => selectKart(d))
}

const selectKart = (kartData) => {
    if (selectedKartElement !== null) {
        selectedKartElement.attr("class", "ysiriwar_kart_img");
    }

    console.log("selectedKart", kartData);
    selectedKart = kartData;

    selectedKartElement = d3.select(`#${kartData.kart.split(" ").join("")}`);
    selectedKartElement.attr("class", "ysiriwar_kart_img active");

    let selectedKartLabel = d3.select(".ysiriwar_selected_kart_name");
    let selectedKartImg = d3.select(".ysiriwar_selected_kart_img");

    selectedKartLabel
        .style("opacity", 0)
        .text(`${selectedKart.kart}`)
        .transition()
        .duration(500)
        .text(selectedKart.kart)
        .style("opacity", "1");

    selectedKartImg.attr("src", `${selectedKart.image}`)
        .style("width", "90px").style("height", "80px")
        .style("opacity", 0)
        .transition()
        .duration(800)
        .style("opacity", "1");

    drawKartHorizontalChart();
}

const getCharacterKart = (value) => {
    console.log("getCharacterKart => ", value);

    let characterAttrContainer = d3.select(".ysiriwar_character_attr_container");
    let kartAttrContainer = d3.select(".ysiriwar_kart_attr_container");

    if (value === "characters") {
        kartAttrContainer.transition()
            .duration(500)
            .style("opacity", 0)
            .transition()
            .duration(500)
            .style("visibility", "hidden")

        characterAttrContainer.transition()
            .duration(800)
            .delay(200)
            .style("opacity", 1)
            .style("visibility", "visible")
    } else {
        characterAttrContainer.transition()
            .duration(500)
            .style("opacity", 0)
            .transition()
            .duration(200)
            .style("visibility", "hidden")

        kartAttrContainer.style("visibility", "visible")
            .transition()
            .duration(800)
            .delay(200)
            .style("opacity", 1)
            
    }
}

const formatKartObjForStatsChart = () => {
    let newArrayObj = [];

    for (let [key, value] of Object.entries(selectedKart)) {
        if (key === "kart" || key === "image") {
            continue;
        }

        switch (key) {
            case "weight":
                newObj = { name: "Weight", value: value };
                newArrayObj.push(newObj);
                break;
            case "acceleration":
                newObj = { name: "Acceleration", value: value };
                newArrayObj.push(newObj);
                break;
            case "groundSpeed":
                newObj = { name: "Ground Speed", value: value };
                newArrayObj.push(newObj);
                break;
            case "groundHandling":
                newObj = { name: "Ground Handling", value: value };
                newArrayObj.push(newObj);
                break;
            case "onRoadTraction":
                newObj = { name: "On Road Traction", value: value };
                newArrayObj.push(newObj);
                break;
            default:
                return;
        }
    }

    return newArrayObj;
}