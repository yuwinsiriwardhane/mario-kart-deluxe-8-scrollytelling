var ysiriwarSelectedGlider= null;
var ysiriwarGliderStatsSvg = null;
var ysiriwarSelectedGliderElement = null;

var ysiriwarGliderDataset = [];

const ysiriwarDrawGliderScales = () => {
    ysiriwarGliderStatsSvg = d3.select(".ysiriwar_glider_stats_svg").attr("width", "1000px").attr("height", "900px");
    ysiriwarGliderStatsSvg.append("g").attr("transform", `translate(250, 800)`).call(ysiriwarXAxis);
    ysiriwarGliderStatsSvg.append("g").attr("transform", `translate(-25, 0)`).call(ysiriwarYAxis);
}

const ysiriwarDrawGliderIntitalBackgroundRects = () => {
    ysiriwarCreateLinearGradient(ysiriwarGliderStatsSvg);

    ysiriwarGliderStatsSvg.append("g")
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
        ysiriwarGliderStatsSvg.append("g")
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

const ysiriwarDrawGliderHorizontalChart = () => {
    ysiriwarGliderStatsSvg.selectAll(".bar").transition().duration(1000).attr("width", 0).style("opacity", "0").remove();

    let newGliderObjArray = ysiriwarFormatObjForStatsChart(ysiriwarSelectedGlider);
    console.log("newGliderObjArray", newGliderObjArray);


    ysiriwarGliderStatsSvg.append("g")
        .selectAll(".bar")
        .data(newGliderObjArray)
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
        )
}

const ysiriwarWrangleGliderDataset = (dataset) => {
    ysiriwarGliderDataset = dataset.map((item) => {
        let newObj = {
            "image": `./images/ysiriwar/gliders/${item["Body"].split(" ").join("")}.webp`,
            "glider": item["Body"],
            "acceleration": item["Acceleration"],
            "groundSpeed": item["Ground Speed"],
            "groundHandling": item["Ground Handling"],
            "weight": item["Weight"],
            "onRoadTraction": item["On Road Traction"]
        }

        return newObj;
    });

    console.log("wrangleGliderDataset => ", ysiriwarGliderDataset);
    return ysiriwarGliderDataset;
}

const ysiriwarPopulateGliderImages = () => {
    let gliderContainer = d3.select(".ysiriwar_glider_container");

    gliderContainer.selectAll("img")
        .data(ysiriwarGliderDataset)
        .join(
            (enter) =>
                enter
                    .append("img")
                    .attr("class", "ysiriwar_glider_img")
                    .attr("id", (d) => {
                        let formatName = d.glider.split(" ").join("")
                        return formatName;
                    })
                    .attr("src", (d) => d.image)
                    .style("width", "110px")
                    .style("height", "110px")
                    .style("opacity", "0")
                    .call(selection => {
                        selection.transition().duration(1000).style("opacity", "1")
                    }),
            (update) => update,
            (exit) => exit
        )
        .on("click", (event, d) => ysiriwarSelectGlider(d))
        .on("mouseover", function(e, d) {
            ysiriwarToolTip.style("visibility", "visible").html(`${d.glider}`)
        })
        .on("mousemove", function (event) {
            return ysiriwarToolTip.style("top", `${(event.pageY + 55)}px`).style("left", `${event.pageX - 50}px`)
        })
        .on("mouseout", function (event) {
            ysiriwarToolTip.style("visibility", "hidden");
        })
}

const ysiriwarSelectGlider= (gliderData) => {
    if (ysiriwarSelectedGliderElement !== null) {
        ysiriwarSelectedGliderElement.attr("class", "ysiriwar_glider_img");
    }

    console.log("ysiriwarSelectedGlider", gliderData);
    ysiriwarSelectedGlider= gliderData;

    ysiriwarSelectedGliderElement = d3.select(`#${gliderData.glider.split(" ").join("")}`);
    ysiriwarSelectedGliderElement.attr("class", "ysiriwar_glider_img active");

    let ysiriwarSelectedGliderLabel = d3.select(".ysiriwar_selected_glider_name");
    let ysiriwarSelectedGliderImg = d3.select(".ysiriwar_selected_glider_img");

    ysiriwarSelectedGliderLabel
        .style("opacity", 0)
        .text(`${ysiriwarSelectedGlider.glider}`)
        .transition()
        .duration(500)
        .text(ysiriwarSelectedGlider.glider)
        .style("opacity", "1");

    ysiriwarSelectedGliderImg.attr("src", `${ysiriwarSelectedGlider.image}`)
        .style("width", "100px").style("height", "90px")
        .style("opacity", 0)
        .transition()
        .duration(800)
        .style("opacity", "1");

    ysiriwarDrawGliderHorizontalChart();
    ysiriwarDrawOverallHorizontalChart();
}
