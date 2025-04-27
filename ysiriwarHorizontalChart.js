var characterDataset = [];
var mainStats = ["Weight", "Acceleration", "Ground Speed", "Ground Handling", "On Road Traction"]

var selectedCharacter = null;
var characterStatsSvg = null;
var selectedCharacterElement = null;
var xScale = null;
var yScale = null;
var xAxis = null;
var yAxis = null;


document.addEventListener("DOMContentLoaded", () => {
    importCharacterDataset();
    drawScales();
    drawIntitalBackgroundRects();
});

const drawScales = () => {
    characterStatsSvg = d3.select(".character_stats_svg").attr("width", "1000px").attr("height", "900px");

    xScale = d3.scaleLinear().domain([0, 11]).range([10, 650]);
    yScale = d3.scaleBand().domain(mainStats.map(d => d)).range([0, 800]).padding(0.2);

    xAxis = d3.axisBottom(xScale).tickSize(8).tickPadding(20).tickFormat((d) => {
        return d === 11 ? "⭐️" : d;
    });

    yAxis = d3.axisRight(yScale).tickSize(8).tickPadding(20);

    characterStatsSvg.append("g").attr("transform", `translate(250, 800)`).call(xAxis);
    characterStatsSvg.append("g").attr("transform", `translate(-10, -20)`).call(yAxis);
}

const drawIntitalBackgroundRects = () => {
    characterStatsSvg.append("defs")
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

    characterStatsSvg.append("g")
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
                    .attr("transform", "translate(250, 12)")
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
        characterStatsSvg.append("g")
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
                        .attr("transform", "translate(252, 12)")
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

const drawHorizontalChart = () => {
    characterStatsSvg.selectAll(".bar").transition().duration(1000).attr("width", 0).style("opacity", "0").remove();

    let newCharacterObjArray = formatCharacterObjForStatsChart();
    console.log("newCharacterObjArray", newCharacterObjArray);


    characterStatsSvg.append("g")
        .selectAll(".bar")
        .data(newCharacterObjArray)
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
                    .attr("transform", "translate(250, 12)")
                    .style("opacity", "0")
                    .call((selection) => {
                        selection.transition()
                            .duration(800)
                            .delay(400)
                            .attr("width", (d) => xScale(+d.value))
                            .style("opacity", "0.8")
                    }),
            (update) => update,
            (exit) => exit
        )
}

const importCharacterDataset = () => {
    d3.csv("/data/MK8_Character_Stats.csv").then(data => {
        console.log("characterDataset => ", data);
        characterDataset = wrangleCharacterDataset(data);
        populateCharacterImages();
    });
}

const wrangleCharacterDataset = (dataset) => {
    characterDataset = dataset.map((item) => {
        let newObj = {
            "image": `/images/ysiriwar/characters/${item["Driver"]}.webp`,
            "driver": item["Driver"],
            "acceleration": item["Acceleration"],
            "groundSpeed": item["Ground Speed"],
            "groundHandling": item["Ground Handling"],
            "weight": item["Weight"],
            "onRoadTraction": item["OnRoad Traction"]
        }

        return newObj;
    });

    console.log("wrangleCharacterDataset => ", characterDataset);
    return characterDataset;
}

const populateCharacterImages = () => {
    let characterContainer = d3.select(".ysiriwar_character_container");
    console.log("dasdas => ", characterDataset);
    characterContainer.selectAll("img")
        .data(characterDataset)
        .join(
            (enter) =>
                enter
                    .append("img")
                    .attr("class", "ysiriwar_character_img")
                    .attr("id", (d) => {
                        let formatName = d.driver.split(" ").join("")
                        return formatName;
                    })
                    .attr("src", (d) => d.image)
                    .style("width", "85px")
                    .style("height", "85px")
                    .style("opacity", "0")
                    .call(selection => {
                        selection.transition().duration(1000).style("opacity", "1")
                    }),
            (update) => update,
            (exit) => exit
        )
        .on("click", (event, d) => selectCharacter(d))
}

const selectCharacter = (characterData) => {
    if (selectedCharacterElement !== null) {
        selectedCharacterElement.attr("class", "ysiriwar_character_img");
    }

    console.log("selectCharacter", characterData);
    selectedCharacter = characterData;

    selectedCharacterElement = d3.select(`#${characterData.driver.split(" ").join("")}`);
    selectedCharacterElement.attr("class", "ysiriwar_character_img active");

    let selectedCharLabel = d3.select(".selected_character_name");
    let selectedCharImg = d3.select(".selected_character_img");

    selectedCharLabel
        .style("opacity", 0)
        .text(selectedCharacter.driver)
        .transition()
        .duration(500)
        .text(selectedCharacter.driver)
        .style("opacity", "1");

    selectedCharImg.attr("src", `${selectedCharacter.image}`)
        .style("width", "85px").style("height", "85px")
        .style("opacity", 0)
        .transition()
        .duration(800)
        .style("opacity", "1");

    drawHorizontalChart();
}

const formatCharacterObjForStatsChart = () => {
    let newArrayObj = [];

    for (let [key, value] of Object.entries(selectedCharacter)) {
        if (key === "driver" || key === "image") {
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