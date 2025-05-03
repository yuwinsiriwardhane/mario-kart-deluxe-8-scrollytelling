document.addEventListener("DOMContentLoaded", () => {
    const controller = new ScrollMagic.Controller()

    const titleDivScene = new ScrollMagic.Scene({
        triggerElement: ".titleDiv",
    })
        .setClassToggle(".titleDiv", "fade-in")
    // .addIndicators();

    const introParaScene = new ScrollMagic.Scene({
        triggerElement: ".standardParagraph",
        triggerHook: 0.6
    })
        .setClassToggle(".standardParagraph", "fade-in")
    // .addIndicators();

    //------------------- HISTORY DIV -----------------------------------

    const hsitoryDivScene = new ScrollMagic.Scene({
        triggerElement: ".historyDiv",
        triggerHook: 0.3
    })
        .setClassToggle(".historyDiv", "fade-in")
    // .addIndicators();

    const historyDivBarPlotScene = new ScrollMagic.Scene({
        triggerElement: ".salesDiv",
        triggerHook: 0.3
    })
        .setClassToggle(".salesDiv", "fade-in")

    const historyDivScatterPlotScene = new ScrollMagic.Scene({
        triggerElement: "#div_scatterplot",
        triggerHook: 0.5
    })
        .setClassToggle("#div_scatterplot", "fade-in")
    // .addIndicators();

    //------------------- HISTORY DIV -----------------------------------

    //------------------- GAME PLAY MECHANICS DIV -----------------------------------

    const gamePlayMechanicsScene = new ScrollMagic.Scene({
        triggerElement: ".mario-kart-game-play-mechanics-div",
        triggerHook: 0.4
    })
        .setClassToggle(".mario-kart-game-play-mechanics-div", "fade-in")
    // .addIndicators();

    const gamePlayMechanicsCharacterHeadingScene = new ScrollMagic.Scene({
        triggerElement: ".ysiriwar_heading_container ",
        triggerHook: 0.5
    })
        .setClassToggle(".ysiriwar_heading_container", "fade-in")

    const gamePlayMechanicsCharacterControlPanelScene = new ScrollMagic.Scene({
        triggerElement: ".ysiriwar_select_type_control_panel ",
        triggerHook: 0.45
    })
        .setClassToggle(".ysiriwar_select_type_control_panel", "fade-in")
    // .addIndicators()

    const gamePlayMechanicsCharacterScene = new ScrollMagic.Scene({
        triggerElement: ".ysiriwar_character_attr_container ",
        triggerHook: 0.45
    })
        .setClassToggle(".ysiriwar_character_attr_container ", "fade-in")
    // .addIndicators();


    const gamePlayMechanicsKartScene = new ScrollMagic.Scene({
        triggerElement: ".ysiriwar_kart_attr_container ",
        triggerHook: 0.45
    })
        .setClassToggle(".ysiriwar_kart_attr_container ", "fade-in")


    const gamePlayMechanicsTireScene = new ScrollMagic.Scene({
        triggerElement: ".ysiriwar_tire_attr_container ",
        triggerHook: 0.45
    })
        .setClassToggle(".ysiriwar_tire_attr_container ", "fade-in")


    const gamePlayMechanicsGliderScene = new ScrollMagic.Scene({
        triggerElement: ".ysiriwar_glider_attr_container ",
        triggerHook: 0.45
    })
        .setClassToggle(".ysiriwar_glider_attr_container ", "fade-in")

    const gamePlayMechanicsOverallScene = new ScrollMagic.Scene({
        triggerElement: ".ysiriwar_overall_attr_container ",
        triggerHook: 0.7
    })
        .setClassToggle(".ysiriwar_overall_attr_container ", "fade-in")
    // .addIndicators()

    //------------------- GAME PLAY MECHANICS DIV -----------------------------------

    //------------------- COMPETETIVE DIV MECHANICS DIV -----------------------------------


    const competetiveDivScene = new ScrollMagic.Scene({
        triggerElement: ".competitiveDiv",
        triggerHook: 0.9
    })
        .setClassToggle(".competitiveDiv", "fade-in")
    // .addIndicators({
    //     name: "competetiveDivScene"
    // });

    const competetiveDivWorldMapControlPanelScene = new ScrollMagic.Scene({
        triggerElement: ".ysiriwar_control_panel_container",
        triggerHook: 0.9
    })
        .setClassToggle(".ysiriwar_control_panel_container", "fade-in")
    // .addIndicators({
    //     name: "competetiveDivWorldMapControlPanelScene"
    // });


    const competetiveDivWorldMapScene = new ScrollMagic.Scene({
        triggerElement: ".ysiriwar_worldmap_svg_container",
        triggerHook: 0.5
    })
        .setClassToggle(".ysiriwar_worldmap_svg_container", "fade-in")
    // .addIndicators({
    //     name: "competetiveDivWorldMapScene"
    // });


    const competetiveDivWorldMapInfoScene = new ScrollMagic.Scene({
        triggerElement: ".ysiriwar_info_container",
        triggerHook: 0.7
    })
        .setClassToggle(".ysiriwar_info_container", "fade-in")
    // .addIndicators({
    //     name: "competetiveDivScene"
    // });

    const competetiveDivExplParaScene = new ScrollMagic.Scene({
        triggerElement: ".comp_explanation_para",
        triggerHook: 0.7
    })
        .setClassToggle(".comp_explanation_para", "fade-in")
    // .addIndicators({
    //     name: "competetiveDivExplParaScene"
    // });

    const competetiveDivWorldRecordChartScene = new ScrollMagic.Scene({
        triggerElement: ".wrChartDiv",
        triggerHook: 0.7
    })
        .setClassToggle(".wrChartDiv", "fade-in")
    // .addIndicators({
    //     name: "competetiveDivWorldRecordChartScene"
    // });

    const competetiveDivWorldRecordExpParaScene = new ScrollMagic.Scene({
        triggerElement: ".wrChartDiv",
        triggerHook: 0.6
    })
        .setClassToggle(".world_record_explanation", "fade-in")
    // .addIndicators({
    //     name: "competetiveDivWorldRecordExpParaScene"
    // });

    //------------------- COMPETETIVE MECHANICS DIV -----------------------------------


    controller.addScene([titleDivScene, introParaScene, hsitoryDivScene, historyDivScatterPlotScene, historyDivBarPlotScene,
        gamePlayMechanicsScene, gamePlayMechanicsCharacterControlPanelScene, gamePlayMechanicsCharacterScene, gamePlayMechanicsCharacterHeadingScene,
        gamePlayMechanicsKartScene, gamePlayMechanicsTireScene, gamePlayMechanicsGliderScene, gamePlayMechanicsOverallScene,
        competetiveDivScene, competetiveDivWorldMapControlPanelScene, competetiveDivWorldMapScene,
        competetiveDivWorldMapInfoScene, competetiveDivExplParaScene, competetiveDivWorldRecordChartScene, competetiveDivWorldRecordExpParaScene])
})