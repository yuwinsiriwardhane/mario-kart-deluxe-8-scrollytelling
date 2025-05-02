const ysiriwarDrawOverallScales = () => {
    ysiriwarOverallStatsSvg = d3.select(".ysiriwar_overall_stats_svg").attr("width", "1050px").attr("height", "900px");
    ysiriwarOverallStatsSvg.append("g").attr("transform", `translate(250, 800)`).call(ysiriwarXAxis);
    ysiriwarOverallStatsSvg.append("g").attr("transform", `translate(-25, 0)`).call(ysiriwarYAxis);
}

const ysiriwarDrawOverallIntitalBackgroundRects = () => {
    ysiriwarCreateLinearGradient(ysiriwarOverallStatsSvg);

    ysiriwarOverallStatsSvg.append("g")
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

    ysiriwarMainStats.forEach((d, i) => {
        ysiriwarOverallStatsSvg.append("g")
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


const ysiriwarDrawOverallHorizontalChart = () => {
    ysiriwarOverallStatsSvg.selectAll(".bar").transition().duration(1000).attr("width", 0).style("opacity", "0").remove();

    if (ysiriwarSelectedCharacter && ysiriwarSelectedGlider && ysiriwarSelectedKart && ysiriwarSelectedTire) {
        ysiriwarOverallStatsSvg.append("g")
            .selectAll(".bar")
            .data(ysiriwarCalculateOverallStats())
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
                        .attr("transform", "translate(250, 30)")
                        .style("opacity", "0")
                        .call((selection) => {
                            selection.transition()
                                .duration(800)
                                .delay(400)
                                .attr("width", (d) => {
                                    return d.value === "0" ? 0 : ysiriwarXScale(+d.value)
                                })
                                .style("opacity", "0.8")
                        }),
                (update) => update,
                (exit) => exit
            );
    }
    ysiriwarPopulateOverallSelectedImages();

}

const ysiriwarCalculateOverallStats = () => {
    console.log("ysiriwarCalculateOverallStats => ", ysiriwarSelectedCharacter, ysiriwarSelectedGlider, ysiriwarSelectedKart, ysiriwarSelectedTire);

    if (ysiriwarSelectedCharacter && ysiriwarSelectedGlider && ysiriwarSelectedKart && ysiriwarSelectedTire) {
        let weight = ((+ysiriwarSelectedCharacter.weight) + (+ysiriwarSelectedGlider.weight) + (+ysiriwarSelectedKart.weight) + (+ysiriwarSelectedTire.weight)) / 4;
        let acceleration = ((+ysiriwarSelectedCharacter.acceleration) + (+ysiriwarSelectedGlider.acceleration) + (+ysiriwarSelectedKart.acceleration) + (+ysiriwarSelectedTire.acceleration)) / 4;
        let groundHandling = ((+ysiriwarSelectedCharacter.groundHandling) + (+ysiriwarSelectedGlider.groundHandling) + (+ysiriwarSelectedKart.groundHandling) + (+ysiriwarSelectedTire.groundHandling)) / 4;
        let groundSpeed = ((+ysiriwarSelectedCharacter.groundSpeed) + (+ysiriwarSelectedGlider.groundSpeed) + (+ysiriwarSelectedKart.groundSpeed) + (+ysiriwarSelectedTire.groundSpeed)) / 4;
        let onRoadTraction = ((+ysiriwarSelectedCharacter.onRoadTraction) + (+ysiriwarSelectedGlider.onRoadTraction) + (+ysiriwarSelectedKart.onRoadTraction) + (+ysiriwarSelectedTire.onRoadTraction)) / 4;
        
        let newObj = {
            "weight":weight,
            "acceleration": acceleration,
            "groundSpeed": groundSpeed,
            "groundHandling": groundHandling,
            "onRoadTraction": onRoadTraction,
        }

        let newOverallObjArray = ysiriwarFormatObjForStatsChart(newObj);
        console.log("newOverallObjArray", newOverallObjArray);
        return newOverallObjArray;
    }

}

const ysiriwarPopulateOverallSelectedImages = () => {
    let selectedCharacterImgElement = d3.select(".ysiriwar_overall_character_img");
    let selectedKartImgElement = d3.select(".ysiriwar_overall_kart_img");
    let selectedTireImgElement = d3.select(".ysiriwar_overall_tire_img");
    let selectedGliderImgElement = d3.select(".ysiriwar_overall_glider_img");
    let overallTextElement = d3.select(".ysiriwar_selected_overall_name");

    if (ysiriwarSelectedCharacter) {
        selectedCharacterImgElement.attr("src", `${ysiriwarSelectedCharacter.image}`)
        .style("width", "110px").style("height", "90px")
        .style("opacity", 0)
        .transition()
        .duration(800)
        .style("opacity", "1");
    }

    if (ysiriwarSelectedKart) {
        selectedKartImgElement.attr("src", `${ysiriwarSelectedKart.image}`)
        .style("width", "110px").style("height", "90px")
        .style("opacity", 0)
        .transition()
        .duration(800)
        .style("opacity", "1");
    }

    if (ysiriwarSelectedTire) {
        selectedTireImgElement.attr("src", `${ysiriwarSelectedTire.image}`)
        .style("width", "110px").style("height", "90px")
        .style("opacity", 0)
        .transition()
        .duration(800)
        .style("opacity", "1");
    }

    if (ysiriwarSelectedGlider) {
        selectedGliderImgElement.attr("src", `${ysiriwarSelectedGlider.image}`)
        .style("width", "110px").style("height", "90px")
        .style("opacity", 0)
        .transition()
        .duration(800)
        .style("opacity", "1");
    }

    overallTextElement.text("Overall Build Stats")
}