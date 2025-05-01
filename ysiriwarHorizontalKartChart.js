var ysiriwarSelectedKart = null;
var ysiriwarKartStatsSvg = null;
var ysiriwarSelectedKartElement = null;

var ysiriwarKartDataset = [];

const ysiriwarDrawKartScales = () => {
    ysiriwarKartStatsSvg = d3.select(".ysiriwar_kart_stats_svg").attr("width", "1000px").attr("height", "900px");
    ysiriwarKartStatsSvg.append("g").attr("transform", `translate(250, 800)`).call(ysiriwarXAxis);
    ysiriwarKartStatsSvg.append("g").attr("transform", `translate(-25, 0)`).call(ysiriwarYAxis);
}

const ysiriwarDrawKartIntitalBackgroundRects = () => {
    ysiriwarCreateLinearGradient(ysiriwarKartStatsSvg);

    ysiriwarKartStatsSvg.append("g")
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
        ysiriwarKartStatsSvg.append("g")
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

const ysiriwarDrawKartHorizontalChart = () => {
    ysiriwarKartStatsSvg.selectAll(".bar").transition().duration(1000).attr("width", 0).style("opacity", "0").remove();

    let newKartObjArray = ysiriwarFormatObjForStatsChart(ysiriwarSelectedKart);
    console.log("newKartObjArray", newKartObjArray);


    ysiriwarKartStatsSvg.append("g")
        .selectAll(".bar")
        .data(newKartObjArray)
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

const ysiriwarWrangleKartDataset = (dataset) => {
    ysiriwarKartDataset = dataset.map((item) => {
        let newObj = {
            "image": `/images/ysiriwar/karts/${item["Body"].split(" ").join("")}.webp`,
            "kart": item["Body"],
            "acceleration": item["Acceleration"],
            "groundSpeed": item["Ground Speed"],
            "groundHandling": item["Ground Handling"],
            "weight": item["Weight"],
            "onRoadTraction": item["On Road Traction"]
        }

        return newObj;
    });

    console.log("wrangleKartDataset => ", ysiriwarKartDataset);
    return ysiriwarKartDataset;
}

const ysiriwarPopulateKartImages = () => {
    let kartContainer = d3.select(".ysiriwar_kart_container");

    kartContainer.selectAll("img")
        .data(ysiriwarKartDataset)
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
                    .style("width", "85px")
                    .style("height", "75px")
                    .style("opacity", "0")
                    .call(selection => {
                        selection.transition().duration(1000).style("opacity", "1")
                    }),
            (update) => update,
            (exit) => exit
        )
        .on("click", (event, d) => ysiriwarSelectKart(d))
        .on("mouseover", function(e, d) {
            ysiriwarToolTip.style("visibility", "visible").html(`${d.kart}`)
        })
        .on("mousemove", function (event) {
            return ysiriwarToolTip.style("top", `${(event.pageY + 55)}px`).style("left", `${event.pageX - 30}px`)
        })
        .on("mouseout", function (event) {
            ysiriwarToolTip.style("visibility", "hidden");
        })
}

const ysiriwarSelectKart = (kartData) => {
    if (ysiriwarSelectedKartElement !== null) {
        ysiriwarSelectedKartElement.attr("class", "ysiriwar_kart_img");
    }

    console.log("ysiriwarSelectedKart", kartData);
    ysiriwarSelectedKart = kartData;

    ysiriwarSelectedKartElement = d3.select(`#${kartData.kart.split(" ").join("")}`);
    ysiriwarSelectedKartElement.attr("class", "ysiriwar_kart_img active");

    let ysiriwarSelectedKartLabel = d3.select(".ysiriwar_selected_kart_name");
    let ysiriwarSelectedKartImg = d3.select(".ysiriwar_selected_kart_img");

    ysiriwarSelectedKartLabel
        .style("opacity", 0)
        .text(`${ysiriwarSelectedKart.kart}`)
        .transition()
        .duration(500)
        .text(ysiriwarSelectedKart.kart)
        .style("opacity", "1");

    ysiriwarSelectedKartImg.attr("src", `${ysiriwarSelectedKart.image}`)
        .style("width", "100px").style("height", "90px")
        .style("opacity", 0)
        .transition()
        .duration(800)
        .style("opacity", "1");

    ysiriwarDrawKartHorizontalChart();
    ysiriwarDrawOverallHorizontalChart();
}