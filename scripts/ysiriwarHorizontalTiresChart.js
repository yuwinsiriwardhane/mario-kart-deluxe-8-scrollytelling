var ysiriwarSelectedTire = null;
var ysiriwarTireStatsSvg = null;
var ysiriwarSelectedTireElement = null;

var ysiriwarTireDataset = [];

const ysiriwarDrawTireScales = () => {
    ysiriwarTireStatsSvg = d3.select(".ysiriwar_tire_stats_svg").attr("width", "1000px").attr("height", "900px");
    ysiriwarTireStatsSvg.append("g").attr("transform", `translate(250, 800)`).call(ysiriwarXAxis);
    ysiriwarTireStatsSvg.append("g").attr("transform", `translate(-25, 0)`).call(ysiriwarYAxis);
}

const ysiriwarDrawTireIntitalBackgroundRects = () => {
    ysiriwarCreateLinearGradient(ysiriwarTireStatsSvg);

    ysiriwarTireStatsSvg.append("g")
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
        ysiriwarTireStatsSvg.append("g")
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

const ysiriwarDrawTireHorizontalChart = () => {
    ysiriwarTireStatsSvg.selectAll(".bar").transition().duration(1000).attr("width", 0).style("opacity", "0").remove();

    let newTireObjArray = ysiriwarFormatObjForStatsChart(ysiriwarSelectedTire);
    console.log("newTireObjArray", newTireObjArray);


    ysiriwarTireStatsSvg.append("g")
        .selectAll(".bar")
        .data(newTireObjArray)
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

const ysiriwarWrangleTireDataset = (dataset) => {
    ysiriwarTireDataset = dataset.map((item) => {
        let newObj = {
            "image": `/images/ysiriwar/tires/${item["Body"].split(" ").join("")}.webp`,
            "tire": item["Body"],
            "acceleration": item["Acceleration"],
            "groundSpeed": item["Ground Speed"],
            "groundHandling": item["Ground Handling"],
            "weight": item["Weight"],
            "onRoadTraction": item["On Road Traction"]
        }

        return newObj;
    });

    console.log("wrangleTireDataset => ", ysiriwarTireDataset);
    return ysiriwarTireDataset;
}

const ysiriwarPopulateTireImages = () => {
    let tireContainer = d3.select(".ysiriwar_tire_container");

    tireContainer.selectAll("img")
        .data(ysiriwarTireDataset)
        .join(
            (enter) =>
                enter
                    .append("img")
                    .attr("class", "ysiriwar_tire_img")
                    .attr("id", (d) => {
                        let formatName = d.tire.split(" ").join("")
                        return formatName;
                    })
                    .attr("src", (d) => d.image)
                    .style("width", "120px")
                    .style("height", "110px")
                    .style("opacity", "0")
                    .call(selection => {
                        selection.transition().duration(1000).style("opacity", "1")
                    }),
            (update) => update,
            (exit) => exit
        )
        .on("click", (event, d) => ysiriwarSelectTire(d))
        .on("mouseover", function(e, d) {
            ysiriwarToolTip.style("visibility", "visible").html(`${d.tire}`)
        })
        .on("mousemove", function (event) {
            return ysiriwarToolTip.style("top", `${(event.pageY + 55)}px`).style("left", `${event.pageX - 50}px`)
        })
        .on("mouseout", function (event) {
            ysiriwarToolTip.style("visibility", "hidden");
        })
}

const ysiriwarSelectTire = (tireData) => {
    if (ysiriwarSelectedTireElement !== null) {
        ysiriwarSelectedTireElement.attr("class", "ysiriwar_tire_img");
    }

    console.log("ysiriwarSelectedTire", tireData);
    ysiriwarSelectedTire = tireData;

    ysiriwarSelectedTireElement = d3.select(`#${tireData.tire.split(" ").join("")}`);
    ysiriwarSelectedTireElement.attr("class", "ysiriwar_tire_img active");

    let ysiriwarSelectedTireLabel = d3.select(".ysiriwar_selected_tire_name");
    let ysiriwarSelectedTireImg = d3.select(".ysiriwar_selected_tire_img");

    ysiriwarSelectedTireLabel
        .style("opacity", 0)
        .text(`${ysiriwarSelectedTire.tire}`)
        .transition()
        .duration(500)
        .text(ysiriwarSelectedTire.tire)
        .style("opacity", "1");

    ysiriwarSelectedTireImg.attr("src", `${ysiriwarSelectedTire.image}`)
        .style("width", "100px").style("height", "90px")
        .style("opacity", 0)
        .transition()
        .duration(800)
        .style("opacity", "1");

    ysiriwarDrawTireHorizontalChart();
    ysiriwarDrawOverallHorizontalChart();
}
