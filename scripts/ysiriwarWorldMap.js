var worldMapSvg = "";
var selectedSeason = "";

var radiusScale = null;
var pathGenerator = null;

var worlMapData = [];
var leaderboardDataset = [];
var filteredDataset = [];

var seasonDataset = ["Select Season", "All Seasons", "Season 4", "Season 5", "Season 6", "Season 7", "Season 8", "Season 9", "Season 10", "Season 11", "Season 12", "Season 13"]

document.addEventListener("DOMContentLoaded", () => {
    importLeaderboardDataset();
    populateSeasonSelectBox();
    drawWorldMapProjection();
});

const drawSelectedSeasonText = () => {
    worldMapSvg.selectAll(".ysiriwar_selected_season_text").transition().duration(500).style("opacity", 0).remove();
    worldMapSvg.selectAll("#ysiriwar_star_image").transition().duration(500).style("opacity", 0).remove();

    const selectedSeasonText = worldMapSvg.append("g").attr("transform", "translate(40, 80)");
    const seasonImage = worldMapSvg.append("g").attr("transform", "translate(130, 25)");

    selectedSeasonText.append("g")
        .append("text")
        .attr("class", "ysiriwar_selected_season_text")
        .text(`${selectedSeason === "all" ? "All Seasons" : `Season ${selectedSeason}`}`)
        .attr("transform", "translate(-25, -25)")
        .attr("opacity", 0)
        .transition()
        .duration(2000)
        .attr("opacity", 0.9);

    seasonImage.selectAll("image")
        .data(["./images/ysiriwar/items/StarMK8.webp", "./images/ysiriwar/items/BulletBillMK8.webp"])
        .join(
            (enter) =>
                enter
                    .append("image")
                    .attr("id", "ysiriwar_star_image")
                    .attr("href", (d) => {
                        return d
                    })
                    .transition()
                    .duration(1000)
                    .attr("width", 40)
                    .attr("height", 40)
                    .attr("x", (d, i) => selectedSeason === "all" ? (i * 50) + 50 : (i * 50) + 10)
                    .attr("y", d => 0),
            update => update,
            exit => exit
        )
}

const drawLegends = () => {
    const legendRadius = worldMapSvg.append("g").attr("transform", "translate(80, 680)")
    const legendColor = worldMapSvg.append("g").attr("transform", "translate(30, 463)")

    legendRadius.append("g")
        .selectAll("circle")
        .data([70, 30, 5])
        .join(
            (enter) =>
                enter
                    .append("circle")
                    .attr("cx", 0)
                    .attr("cy", (d, i) => 0)
                    .attr("r", 0)
                    .attr("transform", "translate(0, -5)")
                    .call((selection) => {
                        selection.transition().duration(2000).attr("r", d => d).attr("fill", "none")
                            .attr("stroke", "yellow")
                    }),
            update => update,
            exit => exit
        );

    legendRadius.append("g")
        .selectAll("text")
        .data(["", 5, 70])
        .join(
            (enter) =>
                enter
                    .append("text")
                    .attr("class", "ysiriwar_circle_size_legend")
                    .attr("x", (d, i) => {
                        if (d === 70) {
                            return (i * 30) + 50
                        }

                        return (i * 30) + 43
                    })
                    .attr("y", 0)
                    .text(d => d)
                    .attr("transform", "translate(-35, 0)")
                    .attr("opacity", 0)
                    .call((selection) => {
                        selection.transition().duration(2000).attr("opacity", 0.9);
                    }),
            update => update,
            exit => exit
        );

    legendRadius.append("g")
        .append("text")
        .attr("class", "ysiriwar_circle_size__legend_text")
        .text("Number of Players (Circle Size)")
        .attr("transform", "translate(-70, 95)")
        .attr("opacity", 0)
        .transition()
        .duration(2000)
        .attr("opacity", 0.9)

    legendColor.append("g")
        .selectAll("circle")
        .data(["#FFD700", "#C0C0C0", "#a66b25", "#0000A3"])
        .join(
            (enter) =>
                enter
                    .append("circle")
                    .attr("cx", -10)
                    .attr("cy", (d, i) => i * 40)
                    .attr("r", 0)
                    .attr("fill", (d) => d)
                    .attr("stroke", "white")
                    .call((selection) => {
                        selection.transition().duration(2000).attr("r", 8);
                    }),
            update => update,
            exit => exit
        );

    legendColor.append("g")
        .selectAll("text")
        .data(["Rank 1 (Rank 2 and 3 same country)", "Rank 2 (Rank 3 same country)", "Rank 3", "Rank 4 - 10"])
        .join(
            (enter) =>
                enter
                    .append("text")
                    .attr("class", "ysiriwar_circle_color_legend_text")
                    .attr("x", 10)
                    .attr("y", (d, i) => (i * 40) + 5)
                    .text(d => d)
                    .attr("opacity", 0)
                    .call((selection) => {
                        selection.transition().duration(2000).attr("opacity", 0.9);
                    }),
            update => update,
            exit => exit
        );

    legendColor.append("g")
        .append("text")
        .attr("class", "ysiriwar_circle_color_legend_heading_text")
        .text("Rank Colors")
        .attr("transform", "translate(-20, -25)")
        .attr("opacity", 0)
        .transition()
        .duration(2000)
        .attr("opacity", 0.9);
}

const drawWorldMapProjection = () => {
    worldMapSvg = d3.select("#ysiriwar_world_map_svg").attr("width", "1500px").attr("height", "795px");

    d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson").then(data => {
        worlMapData = data;
        console.log("mapData => ", worlMapData);

        const projection = d3.geoMercator().scale(210).translate([780, 520]);
        pathGenerator = d3.geoPath().projection(projection);

        const defs = worldMapSvg.append("defs");

        const glowFilter = defs.append("filter")
            .attr("id", "glow")
            .attr("x", "-30%")
            .attr("y", "-30%")
            .attr("width", "200%")
            .attr("height", "200%");

        glowFilter.append("feGaussianBlur")
            .attr("stdDeviation", "4")
            .attr("result", "cloredBlur");

        const glowFilterFeMerge = glowFilter.append("feMerge");
        glowFilterFeMerge.append("feMergeNode").attr("in", "cloredBlur");
        glowFilterFeMerge.append("feMergeNode").attr("in", "SourceGraphic");

        const combinedFilter = defs.append("filter")
            .attr("id", "glow-shadow")
            .attr("x", "-50%")
            .attr("y", "-50%")
            .attr("width", "200%")
            .attr("height", "200%");

        combinedFilter.append("feDropShadow")
            .attr("dx", "0")
            .attr("dy", "2")
            .attr("stdDeviation", "3")
            .attr("flood-color", "rgba(10,13,15,1)")
            .attr("result", "shadow");

        combinedFilter.append("feGaussianBlur")
            .attr("stdDeviation", "3")
            .attr("result", "blur");

        combinedFilter.append("feFlood")
            .attr("flood-color", "steelblue")
            .attr("flood-opacity", "0.6")
            .attr("result", "glowColor");

        combinedFilter.append("feComposite")
            .attr("in", "glowColor")
            .attr("in2", "blur")
            .attr("operator", "in")
            .attr("result", "coloredGlow");

        const combinedFilterFeMerge = combinedFilter.append("feMerge");
        combinedFilterFeMerge.append("feMergeNode").attr("in", "coloredGlow");
        combinedFilterFeMerge.append("feMergeNode").attr("in", "shadow");
        combinedFilterFeMerge.append("feMergeNode").attr("in", "SourceGraphic");

        radiusScale = d3.scaleSqrt().domain([0, 70]).range([7, 60]);

        worldMapSvg.append("g")
            .selectAll(".path")
            .data(worlMapData.features)
            .join(
                (enter) =>
                    enter
                        .append("path")
                        .attr("d", pathGenerator)
                        .attr("fill", "#686D76")
                        .attr("stroke", "#ff9999")
                        .attr("opacity", "0")
                        .call(selection => {
                            selection.transition().duration(1000).attr("opacity", 0.8)
                        }),
                (update) => update,
                (exit) => exit
            );

        drawLegends();
    });
}

const drawCircles = () => {
    let tempWorkingMapDataset = wrangleMapData();
    let toolTip = d3.select(".ysiriwar_tooltip");

    worldMapSvg.selectAll(".ysiriwar_circle").transition().duration(1000).attr("r", 0).remove();
    worldMapSvg.selectAll(".ysiriwar_circle_text").transition().duration(500).style("opacity", 0).remove();
    drawSelectedSeasonText();

    worldMapSvg.append("g")
        .selectAll("circle")
        .data(tempWorkingMapDataset.features)
        .join(
            (enter) =>
                enter
                    .append("circle")
                    .attr("cx", (d) => pathGenerator.centroid(d)[0])
                    .attr("cy", (d) => pathGenerator.centroid(d)[1])
                    .attr("opacity", 1)
                    .attr("r", 0)
                    .call(selection => {
                        selection.transition().delay(100).duration(1500).attr("r", (d) => {
                            return d.properties.totalPlayers ? radiusScale(d.properties.totalPlayers.length) : 0;
                        })
                            .transition()
                            .duration(500)
                            .attr("opacity", 0.8)
                    }),
            (update) => update,
            (exit) => exit
        )
        .attr("fill", (d) => {
            if (d.properties.rankAvailability && selectedSeason !== 'all') {
                if (d.properties.rankAvailability.includes("1")) {
                    return "#FFD700";
                }

                if (d.properties.rankAvailability.includes("2")) {
                    return "#C0C0C0";
                }


                if (d.properties.rankAvailability.includes("3")) {
                    return "#a66b25";
                    return "#CE8946";
                }
            }

            if (selectedSeason === "all") {
                return "#03b0e9"
            }

            return "#0000A3";
        })
        .attr("class", "ysiriwar_circle")
        .attr("filter", "url(#glow)")
        .style("transition", "filter 2s ease")
        .on("mouseover", function (e, d) {
            const [cx, cy] = [d3.select(this).attr("cx"), d3.select(this).attr("cy")];

            toolTip.style("visibility", "visible")
            getHtmlStructureForTooltip(d);

            d3.select(this)
                .attr("filter", "url(#glow-shadow)")
                .style("transform-origin", `${cx}px ${cy}px`)
                .transition()
                .duration(500)
                .attr("opacity", 1)
                .style("transform", "scale(1.2)")

            let textElement = document.getElementById(`${d.properties.name}_text`);
            textElement.style.transition = 'font-size 0.5s ease-in-out, opacity 0.5s ease-in-out';
            textElement.style.fontSize = "18px";
            textElement.style.opacity = "1";

            let imageElement = document.getElementById(`${d.properties.name}_flag`);
            imageElement.style.transition = 'opacity 0.5s ease-in-out';
            imageElement.style.opacity = "1";
        })
        .on("mousemove", function (event) {
            return toolTip.style("top", `${(event.pageY + 65)}px`).style("left", `${event.pageX - 50}px`)
        })
        .on("mouseout", function (e, d) {
            d3.select(this)
                .attr("filter", "url(#glow)")
                .transition()
                .duration(500)
                .attr("opacity", 0.8)
                .style("transform", "scale(1)")

            let textElement = document.getElementById(`${d.properties.name}_text`);
            textElement.style.transition = 'font-size 0.5s ease-in-out, opacity 1s ease-in-out';
            textElement.style.fontSize = "16px";
            textElement.style.opacity = "0.5";

            let imageElement = document.getElementById(`${d.properties.name}_flag`);
            imageElement.style.transition = 'opacity 0.5s ease-in-out';
            imageElement.style.opacity = "0.5";

            toolTip.style("visibility", "hidden");
        })

    let tempTextElement = worldMapSvg.append("text")
        .attr("class", "temp-text")
        .style("visibility", "hidden")

    worldMapSvg.append("g")
        .selectAll("image")
        .data(tempWorkingMapDataset.features)
        .join(
            (enter) =>
                enter
                    .append("image")
                    .attr("class", "ysiriwar_circle_text")
                    .attr("id", d => `${d.properties.name}_flag`)
                    .attr("href", (d) => {
                        if (d.properties.totalPlayers) {
                            return d.properties.totalPlayers[0]["flag"];
                        }
                    })
                    .attr("width", 35)
                    .attr("height", 35)
                    .attr("x", d => pathGenerator.centroid(d)[0])
                    .attr("y", d => pathGenerator.centroid(d)[1])
                    .attr("transform", d => {
                        tempTextElement.text(d.properties.name);
                        let bbox = tempTextElement.node().getBBox();
                        let xValue = d.properties.totalPlayers ? radiusScale(d.properties.totalPlayers.length) + (bbox.width + 70) : 0;
                        return `translate(${-xValue}, -16)`
                    })
                    .style("opacity", 0)
                    .call((selection) => {
                        selection.transition().duration(1000).style("opacity", 0.5)
                    }),
            update => update,
            exit => exit
        )


    worldMapSvg.append("g")
        .selectAll("text")
        .data(tempWorkingMapDataset.features)
        .join(
            (enter) =>
                enter
                    .append("text")
                    .attr("class", "ysiriwar_circle_text")
                    .attr("id", d => `${d.properties.name}_text`)
                    .attr("x", d => pathGenerator.centroid(d)[0])
                    .attr("y", d => pathGenerator.centroid(d)[1])
                    .text(d => {
                        return d.properties.totalPlayers ? d.properties.name : ""
                    })
                    .attr("transform", d => {
                        tempTextElement.text(d.properties.name);
                        let bbox = tempTextElement.node().getBBox();
                        let xValue = d.properties.totalPlayers ? radiusScale(d.properties.totalPlayers.length) + (bbox.width + 30) : 0;
                        return `translate(${-xValue}, 6)`
                    })
                    .style("opacity", 0)
                    .style("fill", (d) => {
                        return "white"
                    })
                    .call((selection) => {
                        selection.transition().duration(1000).style("opacity", 0.5)
                    }),
            update => update,
            exit => exit
        )

    tempTextElement.remove();
}

const wrangleMapData = () => {
    let tempWorkingMapDataset = structuredClone(worlMapData);
    let groupedByCountryLeaderboardDataset = Array.from(d3.group(filteredDataset, (d) => d.country));
    console.log("groupedByCountryLeaderboardDataset => ", groupedByCountryLeaderboardDataset);

    for (let item1 of tempWorkingMapDataset.features) {
        let rankAvailability = [];

        for (let item2 of groupedByCountryLeaderboardDataset) {
            if (item1.properties.name === item2[0]) {
                for (let item of item2[1]) {
                    rankAvailability.push(item.rank);
                }

                item1.properties.totalPlayers = item2[1];
                item1.properties.rankAvailability = rankAvailability;
            }
        }
    }

    console.log("tempWorkingMapDataset => ", tempWorkingMapDataset);
    return tempWorkingMapDataset
}

const importLeaderboardDataset = () => {
    d3.csv("./data/MK8_Leaderboard_Data.csv").then(data => {
        console.log("importLeaderboardDataset => ", data);
        leaderboardDataset = wrangleLeaderboardDataset(data);
    });
}

const wrangleLeaderboardDataset = (dataset) => {
    let cleanedDataset = dataset.map((item) => {
        let modifiedItem = {
            seasonNumber: item["Season_Number"],
            rank: item["Rank"],
            country: item["Country"],
            flag: getCountryFlag(item["Country"]),
            playerName: item["Player_Name"],
            MMR: item["MMR"],
            peakMMR: item["Peak MMR"],
            played: item["Played"],
            winRate: item["Win Rate"],
        }

        return modifiedItem;
    });

    console.log("wrangleLeaderboardDataset => ", cleanedDataset);
    return cleanedDataset;
}

const getCountryFlag = (countryName) => {
    return `./images/ysiriwar/${countryName}.png`
}

const populateSeasonSelectBox = () => {
    let selectElement = d3.select(".ysiriwar_select_season");

    selectElement.selectAll("option")
        .data(seasonDataset)
        .join(
            enter => enter.append("option")
                .attr("value", (d, i) => {
                    if (i === 0) {
                        return "null"
                    }

                    return i === 1 ? "all" : (i + 2)
                })
                .property("disabled", (d, i) => i === 0 ? true : false)
                .property("selected", (d, i) => i === 0 ? true : false)
                .text(d => d),
            update => update,
            exit => exit.remove()
        )
}

const getSeason = (value) => {
    console.log("getSeason => ", value);
    selectedSeason = value;

    filterLeaderBoardDatasetBySeason();
    drawCircles();
}

const filterLeaderBoardDatasetBySeason = () => {
    filteredDataset = selectedSeason === "all" ? leaderboardDataset : leaderboardDataset.filter(item => item.seasonNumber === selectedSeason);
    console.log("filterLeaderBoardDatasetBySeason => ", filteredDataset);
}

const getHtmlStructureForTooltip = (data) => {
    let toolTipFlagImg = d3.select(".tooltip_image");
    let toolTipPlayerCount = d3.select(".ysiriwar_tooltip_player_count");
    let unorderedList = d3.select(".ysiriwar_rank_list");

    unorderedList.selectAll("li").remove();
    toolTipFlagImg.attr("src", data.properties.totalPlayers[0]["flag"]);
    
    if (selectedSeason === "all") {
        toolTipPlayerCount.text(`${data.properties.totalPlayers.length > 1 ? `${data.properties.totalPlayers.length} Players` : `${data.properties.totalPlayers.length} Player`} in top - 10 from all seasons`)
        unorderedList.selectAll("li")
        .data(["Ranks for only individual seasons"])
        .join(
            (enter) =>
                enter
                    .append("li")
                    .text(d => d),
            (update) => update,
            (exit) => exit,
        );
    } else {
        toolTipPlayerCount.text(`${data.properties.totalPlayers.length > 1 ? `${data.properties.totalPlayers.length} Players` : `${data.properties.totalPlayers.length} Player`} in top - 10`)
        unorderedList.selectAll("li")
        .data(data.properties.rankAvailability)
        .join(
            (enter) =>
                enter
                    .append("li")
                    .text(d => `Rank ➜ ${d}`),
            (update) => update,
            (exit) => exit,
        );
    }
}