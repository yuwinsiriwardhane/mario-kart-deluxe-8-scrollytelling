var ysiriwarSelectedCharacter = null;
var ysiriwarCharacterStatsSvg = null;
var ysiriwarSelectedCharacterElement = null;

var ysiriwarCharacterDataset = [];


const ysiriwarDrawScales = () => {
    ysiriwarCharacterStatsSvg = d3.select(".ysiriwar_character_stats_svg").attr("width", "1000px").attr("height", "900px");
    ysiriwarCharacterStatsSvg.append("g").attr("transform", `translate(250, 800)`).call(ysiriwarXAxis);
    ysiriwarCharacterStatsSvg.append("g").attr("transform", `translate(-10, -20)`).call(ysiriwarYAxis);
}

const ysiriwarDrawIntitalCharacterBackgroundRects = () => {
    ysiriwarCreateLinearGradient(ysiriwarCharacterStatsSvg);

    ysiriwarCharacterStatsSvg.append("g")
        .selectAll(".ysiriwar_background_rect")
        .data(ysiriwarMainStats)
        .join(
            (enter) =>
                enter
                    .append("rect")
                    .attr("class", "ysiriwar_background_rect")
                    .attr("x", 0)
                    .attr("y", (d) => {
                        return ysiriwarYScale(d)
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

    ysiriwarMainStats.forEach((d, i) => {
        ysiriwarCharacterStatsSvg.append("g")
            .selectAll(".seperators")
            .data([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
            .join(
                (enter) =>
                    enter.append("line")
                        .attr("class", "seperators")
                        .attr("x1", (d) => ysiriwarXScale(d))
                        .attr("x2", (d) => ysiriwarXScale(d))
                        .attr("y1", ysiriwarYScale(d))
                        .attr("y2", ysiriwarYScale(d) + 55)
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

const ysiriwarDrawHorizontalChart = () => {
    ysiriwarCharacterStatsSvg.selectAll(".bar").transition().duration(1000).attr("width", 0).style("opacity", "0").remove();

    let newCharacterObjArray = ysiriwarFormatObjForStatsChart(ysiriwarSelectedCharacter);
    console.log("newCharacterObjArray", newCharacterObjArray);

    ysiriwarCharacterStatsSvg.append("g")
        .selectAll(".bar")
        .data(newCharacterObjArray)
        .join(
            (enter) =>
                enter
                    .append("rect")
                    .attr("class", "bar")
                    .attr("x", 0)
                    .attr("y", (d) => {
                        return ysiriwarYScale(d.name)
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
                            .attr("width", (d) => ysiriwarXScale(+d.value))
                            .style("opacity", "0.8")
                    }),
            (update) => update,
            (exit) => exit
        )
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
        .on("mouseover", function(e, d) {
            ysiriwarToolTip.style("visibility", "visible").html(`${d.driver}`)
        })
        .on("mousemove", function (event) {
            return ysiriwarToolTip.style("top", `${(event.pageY + 55)}px`).style("left", `${event.pageX - 30}px`)
        })
        .on("mouseout", function (event) {
            ysiriwarToolTip.style("visibility", "hidden");
        })
}

const selectCharacter = (characterData) => {
    if (ysiriwarSelectedCharacterElement !== null) {
        ysiriwarSelectedCharacterElement.attr("class", "ysiriwar_character_img");
    }

    console.log("selectCharacter", characterData);
    ysiriwarSelectedCharacter = characterData;

    ysiriwarSelectedCharacterElement = d3.select(`#${characterData.driver.split(" ").join("")}`);
    ysiriwarSelectedCharacterElement.attr("class", "ysiriwar_character_img active");

    let selectedCharLabel = d3.select(".selected_character_name");
    let selectedCharImg = d3.select(".selected_character_img");

    selectedCharLabel
        .style("opacity", 0)
        .text(ysiriwarSelectedCharacter.driver)
        .transition()
        .duration(500)
        .text(ysiriwarSelectedCharacter.driver)
        .style("opacity", "1");

    selectedCharImg.attr("src", `${ysiriwarSelectedCharacter.image}`)
        .style("width", "85px").style("height", "85px")
        .style("opacity", 0)
        .transition()
        .duration(800)
        .style("opacity", "1")

    ysiriwarDrawHorizontalChart();
    ysiriwarDrawOverallHorizontalChart();
}