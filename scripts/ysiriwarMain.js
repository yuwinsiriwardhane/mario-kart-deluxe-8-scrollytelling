var ysiriwarXScale = null;
var ysiriwarYScale = null;
var ysiriwarXAxis = null;
var ysiriwarYAxis = null;
var ysiriwarToolTip = null;

var ysiriwarSelectedType = "characters";

var ysiriwarMainStats = ["Weight", "Acceleration", "Ground Speed", "Ground Handling", "On Road Traction"]

document.addEventListener("DOMContentLoaded", () => {
    ysiriwarImportDataset();
    ysiriwaInitiateScales();

    ysiriwarDrawIntitalCharacterBackgroundRects();
    ysiriwarDrawKartIntitalBackgroundRects();
    ysiriwarDrawTireIntitalBackgroundRects();
    ysiriwarDrawGliderIntitalBackgroundRects();
    ysiriwarDrawOverallIntitalBackgroundRects();

    ysiriwarToolTip = d3.select(".ysiriwar_tooltip_horizontal_stats");
})

const ysiriwarGetType = (value) => {
    console.log("getCharacterKart => ", value);
    ysiriwarSelectedType = value;

    ysiriwarImportDataset();
    ysiriwarHideStatsContainers(value);
}

const ysiriwarHideStatsContainers = (value) => {
    let characterAttrContainer = d3.select(".ysiriwar_character_attr_container");
    let kartAttrContainer = d3.select(".ysiriwar_kart_attr_container");
    let tiresAttrContainer = d3.select(".ysiriwar_tire_attr_container");
    let glidersAttrContainer = d3.select(".ysiriwar_glider_attr_container");

    ysiriwarSelectedType = value;

    characterAttrContainer.transition()
        .duration(500)
        .style("opacity", 0)
        .transition()
        .duration(200)
        .style("visibility", "hidden");

    kartAttrContainer.transition()
        .duration(500)
        .style("opacity", 0)
        .transition()
        .duration(200)
        .style("visibility", "hidden");

    tiresAttrContainer.transition()
        .duration(500)
        .style("opacity", 0)
        .transition()
        .duration(200)
        .style("visibility", "hidden");

    glidersAttrContainer.transition()
        .duration(500)
        .style("opacity", 0)
        .transition()
        .duration(200)
        .style("visibility", "hidden");

    switch (value) {
        case "characters":
            characterAttrContainer.transition()
                .duration(800)
                .delay(200)
                .style("opacity", 1)
                .style("visibility", "visible");

            break;
        case "karts":
            kartAttrContainer.style("visibility", "visible")
                .transition()
                .duration(800)
                .delay(200)
                .style("opacity", 1);

            break;
        case "tires":
            tiresAttrContainer.style("visibility", "visible")
                .transition()
                .duration(800)
                .delay(200)
                .style("opacity", 1);

            break;
        case "gliders":
            glidersAttrContainer.style("visibility", "visible")
                .transition()
                .duration(800)
                .delay(200)
                .style("opacity", 1);

            break;
        default:
            characterAttrContainer.transition()
                .duration(800)
                .delay(200)
                .style("opacity", 1)
                .style("visibility", "visible");

            break;
    }
}

const ysiriwaInitiateScales = () => {
    ysiriwarXScale = d3.scaleLinear().domain([0, 11]).range([10, 650]);
    ysiriwarYScale = d3.scaleBand().domain(ysiriwarMainStats.map(d => d)).range([0, 800]).padding(0.2);

    ysiriwarXAxis = d3.axisBottom(ysiriwarXScale).tickSize(8).tickPadding(20).tickFormat((d) => {
        return d === 11 ? "⭐️" : d;
    });

    ysiriwarYAxis = d3.axisRight(ysiriwarYScale).tickSize(8).tickPadding(20);

    ysiriwarDrawScales();
    ysiriwarDrawKartScales();
    ysiriwarDrawTireScales();
    ysiriwarDrawGliderScales();
    ysiriwarDrawOverallScales();
}

const ysiriwarImportDataset = () => {
    switch (ysiriwarSelectedType) {
        case "characters":
            d3.csv("../data/MK8_Character_Stats.csv").then(data => {
                console.log("characterDataset => ", data);
                ysiriwarCharacterDataset = wrangleCharacterDataset(data);
                populateCharacterImages();
            });
            break;

        case "karts":
            d3.csv("../data/MK8_Kart_Stats.csv").then(data => {
                console.log("kartDataset => ", data);
                ysiriwarKartDataset = ysiriwarWrangleKartDataset(data);
                ysiriwarPopulateKartImages();
            });
            break;
        case "tires":
            d3.csv("../data/MK8_Tire_Stats.csv").then(data => {
                console.log("tireDataset => ", data);
                ysiriwarTireDataset = ysiriwarWrangleTireDataset(data);
                ysiriwarPopulateTireImages();
            });
            break;
        case "gliders":
            d3.csv("../data/MK8_Gliders_Stats.csv").then(data => {
                console.log("gliderDataset => ", data);
                ysiriwarGliderDataset = ysiriwarWrangleGliderDataset(data);
                ysiriwarPopulateGliderImages();
            });
            break;
        default:
            return;
    }
}

const ysiriwarCreateLinearGradient = (currentSvg) => {
    currentSvg.append("defs")
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
}

const ysiriwarFormatObjForStatsChart = (selectedObj) => {
    console.log("ysiriwarFormatObjForStatsChart => ", ysiriwarCharacterDataset)
    console.log("ysiriwarFormatObjForStatsChart => ", selectedObj)

    let newArrayObj = [];

    for (let [key, value] of Object.entries(selectedObj)) {
        if ((key === "kart" || key === "driver" || key === "tire" || key === "glider") || key === "image") {
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