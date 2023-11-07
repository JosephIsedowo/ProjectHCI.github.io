// var vConsole = new window.VConsole(); // for debug in mobile device

// ----------------LOGIC---------------------
// 1. get which mode: demo or formal
// 2. set the target line and shuffle them
// 3. init parameters
// 4. init the svg container
// 5. init the svg in the svg container
// 6. add shapes to the svg
// 7. add white space at the end of the svg to 
//    make the 99th shape can be at the grey area 
//    when scroll to the bottom
// 8. set the onclick event of the start button
// 9. set the onscroll event in the svg container
// 10. calculate cumlative distance
// ------------------------------------------


// Main

// 1. get which mode: demo or formal
var mode = getQueryVariable("mode")
var info_data = JSON.parse(sessionStorage.getItem("info"))
if (mode == "demo"){
    info_data["mode"] = "demo mode";
}
if (mode == "formal"){
    info_data["mode"] = "formal mode";
}
sessionStorage.setItem("info", JSON.stringify(info_data));

//1.5 get the state of autoswitch
var autoswitch = info_data["autoswitch"];

// 2. set the target line and shuffle them
var unshuffled = [10, 98];
var unshuffled2 = [7, 8];

// 2.5 set different range of target area
var grey_area_height_ratio = [1,2];
var grey_area_height_ratio2 = [1, 1.5, 2]; 

$("#trial_num_demo").text(unshuffled.length * grey_area_height_ratio.length * 2);

if (mode=="formal"){ unshuffled = unshuffled2 } //, 7, 8, 9, 10, 19, 29, 39, 49, 59, 69, 79, 89, 98];} //consider step as 5? test the time
if (mode=="formal"){
    grey_area_height_ratio = grey_area_height_ratio2;
}

// change trial_num
$("#trial_num_formal").text(unshuffled2.length * grey_area_height_ratio2.length * 2);

grey_area_height_ratio = grey_area_height_ratio
    .map(value => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);

var shuffled1 = unshuffled
  .map(value => ({ value, sort: Math.random() }))
  .sort((a, b) => a.sort - b.sort)
  .map(({ value }) => value);

var shuffled2 = unshuffled
    .map(value => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);

function getNewShuffledArray(){
    return unshuffled.map(value => ({ value, sort: Math.random() })).sort((a, b) => a.sort - b.sort).map(({ value }) => value);
}

// 3. init parameters
var posY = 5;
var posX_text = ["1%","95%","88%"]
var posX_rect = ["15%", "45%", "75%"];
var posX_circle = ["20%", "50%", "80%"];
var posX_triangle = [200, 500, 800];
var posX_star = [200, 500, 800];
var colorList = ["#df7d44","#db4677","#5db9e9"];
var round = 0;
var SHOW_NUM = true;
var SHOW_STAR = true;
var insert_symbol_line = shuffled1.shift();  
var grey_area_size;  
var is_timer_start = false;
var begin;
var FLAG = true
var mouse_trace_back = 0;
var direction = -1; //-1: scroll down, +1: scroll up
var cum_distance = 0;
var max_backtracking_distance=0;
var data = { "round":[], "time":[], "target":[], "traceback":[], "cumDistance":[], "maxbacktrack":[], "ratio":[], "datetime":[]}
var topValue = 0;
var interval = null; 
var START_FLAG = false;
var popup = document.getElementById('pop-window');
var poptutorial = document.getElementById('pop-tutorial');
var popswitch  = document.getElementById('pop-switch');
var popend = document.getElementById('pop-end');
var grey_mask = document.getElementById('grey_mask');
var weight_round = 0;
var ratio = NaN;

// get target area height
// var info_data = JSON.parse(sessionStorage.getItem("info"));
// if (info_data["height"] != ""){
//     grey_area_height_ratio = parseInt(info_data["height"]);
// }

// display mask and pop up window
showGreyMask();
openPop(poptutorial);


// 4. initialize the svg container
var width = window.innerWidth;
var navbar_height = document.getElementById("nav").clientHeight;
window.addEventListener('resize', function() {
    navbar_height = document.getElementById("nav").clientHeight;
}, true); // when window size is change, get the navbar height again 
var height = window.innerHeight-navbar_height;
var side_len = Math.min(width, height)
d3.select("#svg-container")
    .style("width", (side_len)+"px")
    .style("height", (side_len)+"px")
    .style("margin-top", (navbar_height)+"px")
    .style("margin-left", "auto")
    .style("margin-right", "auto")
    .style("margin-bottom", "auto")


// 5. initialize the svg in the svg container
var svg = d3.select("#svg");
svg.append("rect")
.attr("width", "100%")
.attr("height", "100%")
.attr("fill", "white");
var g = svg.append("g").classed("group", true);

// 6. add shapes to the svg
add_shapes(insert_symbol_line);

// get the dictance between target and topline
var distance = parseInt($(".star").offset().top-$( window ).scrollTop());
var pre_y = distance;

function setGreyArea() {
    d3.select("#grey_area")
    .style("height",function(){
        grey_area_size = (Math.round(d3.selectAll(".star")._groups[0][0].getBoundingClientRect().height)+15);
        return grey_area_height_ratio[weight_round] * grey_area_size  +"px"
    })
    //set grey area at the center of the svg container
    .style("top", function(){
        return (document.getElementById("svg-container").offsetWidth - grey_area_height_ratio[weight_round] * grey_area_size) / 2 + $(".container-fluid")[0].clientHeight + "px";
    })
}
setGreyArea();

$( window ).resize(function(){
    d3.select("#grey_area")
    .style("height",function(){
        grey_area_size = (Math.round(d3.selectAll(".star")._groups[0][0].getBoundingClientRect().height)+15) ;
        return grey_area_height_ratio[weight_round] * grey_area_size+"px"
    })
    //set grey area at the center of the svg container
    .style("top", function(){
        return Math.round(document.getElementById("svg-container").offsetWidth - grey_area_height_ratio[weight_round] * grey_area_size) / 2 + "px";
    })
})

// 7. add white space at the end of the svg
var total_height = window.innerHeight;
var unit = Math.round(d3.selectAll(".star")._groups[0][0].getBoundingClientRect().width)+5;
var virtualBox_height = side_len-2*unit;
temp_svg = d3.select("#svg-container")
            .append("svg")
            .attr("width", "100%")
            .attr("height", parseInt(virtualBox_height))
            .style("margin-top","-5px");
temp_svg.append("rect")
            .attr("width", "100%")
            .attr("height", "100%")
            .attr("fill", "white");

// 8. set the click event of the start button
$("#btn-close").click(function(){
    closePop(poptutorial);
    openPop(popup);
})

$("#btn-close-switch").click(function(){
    closePop(popswitch);
})

$("#btn-start").click(function(){
    closePop(popup);
    hideGreyMask();
    // when click the button, scroll to the top and hide the grey mask
    $("#svg-container").scrollTop(0);
    $("#grey_mask").hide();
    // start record data
    START_FLAG = true;
    // start counting time
    begin= parseInt(performance.now());
    is_timer_start = true;
    // reset cumulative distance
    cum_distance=0;
    document.getElementById("svg-container").focus();
})

// 9. set the onscroll event in the svg container
$("#grey_area").scroll(function() {
    console.log("text");
})

$("#svg-container").scroll(function() {
    if (START_FLAG==true){
        var offset = document.getElementById("star1").getBoundingClientRect();
        var grey_area_top = $("#grey_area")[0].offsetTop;
        if (-(offset.top-grey_area_top)>max_backtracking_distance){
            max_backtracking_distance = -(offset.top-grey_area_top);
        }
        var y = parseInt(offset.top-$( "#svg-container" ).scrollTop());
        if ((direction==-1) && (y-pre_y>0)){
            mouse_trace_back = mouse_trace_back + 1;
            direction = 1;
        }
        else if ((direction==1) && (y-pre_y<0)){
            mouse_trace_back = mouse_trace_back + 1;
            direction = -1;
        }
        pre_y = y;
        if(interval == null){
            interval = setInterval("isTargetInGreyArea()", 1000);
        }
        topValue = document.documentElement.scrollTop;  
    }
}) 


// 10. calculate cumlative distance
scrollDistance(function (distance) {
	cum_distance = cum_distance+ Math.abs(distance);
});















// Functions

function openPop(pop){
    pop.classList.add("open-popup");
}

function closePop(pop){
    pop.classList.remove("open-popup");
}

function closePopend(){

}

function showGreyMask(){
    grey_mask.classList.add("show-grey_mask");
}

function hideGreyMask(){
    grey_mask.classList.remove("show-grey_mask");
}

function getQueryVariable(variable)
{
       var query = window.location.search.substring(1);
       var vars = query.split("&");
       for (var i=0;i<vars.length;i++) {
               var pair = vars[i].split("=");
               if(pair[0] == variable){return pair[1];}
       }
       return(false);
}

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

// add text to the left and right sides in each line 
function add_text(i, posY){
    for (let j =0; j<2; j++){
        if (i+1>9 && j==1){
            posX = posX_text[2];
        }
        else{
            posX = posX_text[j];
        }
        g.append("text")
            .classed('noselect', true)
            .attr("x", posX)
            .attr("y", posY)
            .attr("dy", 80)
            .style("font-size", 100)
            .style("fill","#b4b4b4")
            .text(i+1);
    }
}

// add shapes (rect, circle, triangle) in the svg
function add_shapes(insert_symbol_line, show_num=true, show_star=true){
    for (let i =0; i<99; i++){
        if (i == insert_symbol_line && show_star==false){
            var star = d3.symbol()
                .type(d3.symbolStar)
                .size(3300);
            for (let j =0; j<3; j++){
                g.append("path")
                .attr("d", star)
                .classed("star", true)
                .attr("id", function(){return "star"+(j)})
                .attr("transform", function(d) { return "translate(" + posX_star[j] + "," + (posY+55) + ")"; })
            }
            if (show_star==false){
                d3.selectAll(".star").style('opacity', 0);
            }
        }
        if (i == insert_symbol_line && show_star==true){
            // posY += 50;
            var star = d3.symbol()
                .type(d3.symbolStar)
                .size(6700);
            for (let j =0; j<3; j++){
                g.append("path")
                .attr("d", star)
                .classed("star", true)
                .attr("id", function(){return "star"+(j+3)})
                .attr("transform", function(d) { return "translate(" + posX_star[j] + "," + (posY+55) + ")"; })
            }
            if (show_num==true){
                add_text(i, posY);
            }
            d3.selectAll(".star").style('opacity', 0);
            var star = d3.symbol()
                .type(d3.symbolStar)
                .size(3000);
            for (let j =0; j<3; j++){
                g.append("path")
                .attr("d", star)
                .attr("id", function(){return "star"+(j)})
                .attr("transform", function(d) { return "translate(" + posX_star[j] + "," + (posY+55) + ")"; })
            }
            // posY += 50;
        }
        else{
            choice = getRandomInt(3);
            if (choice == 0){
                g.append("rect")
                    .attr("x", posX_rect[i%3])
                    .attr("y", posY)
                    .attr("width", 100)
                    .attr("height", 100)
                    .attr("fill", colorList[getRandomInt(3)]);
                if (show_num==true){
                        add_text(i, posY);
                }
            }
            else if (choice == 1){
                g.append("circle")
                    .attr("cx", posX_circle[i%3])
                    .attr("cy", posY+50)
                    .attr("r", 50)
                    .attr("fill", colorList[getRandomInt(3)]);
                if (show_num==true){
                        add_text(i, posY);
                }
            }
            else {
                var triangleSize = 95*95/Math.sqrt(3);
                var triangle = d3.symbol()
                    .type(d3.symbolTriangle)
                    .size(triangleSize);
                g.append("path")
                    .attr("d", triangle)
                    .attr("fill", colorList[getRandomInt(3)])
                    .attr("transform", function(d) { return "translate(" + posX_triangle[i%3] + "," + (posY+60) + ")"; });
                if (show_num==true){
                        add_text(i, posY);
                }
            }  
        }
        posY = posY + 100;
    }
}

// update when the target is at the grey area
function isTargetInGreyArea() {  
    var offset = document.getElementById("star1").getBoundingClientRect();
    var y = offset.top;
    var star_height = offset.height;
    var reset = false;
    var grey_area_top = $("#grey_area")[0].offsetTop;
    var grey_area_height = $("#grey_area")[0].clientHeight;
    var valid_interval = grey_area_height-star_height;
    ratio = grey_area_height_ratio[weight_round];

    //console.log(y, grey_area_top, grey_area_top+valid_interval, document.getElementById("star4"));

    //if(document.documentElement.scrollTop == topValue && y>grey_area_top-18*grey_area_height_ratio[weight_round] && y<grey_area_top+30*grey_area_height_ratio[weight_round]) {
    
    if (autoswitch == 'Click to switch'){
        document.getElementById("svg").onclick = function(){
            if (document.documentElement.scrollTop == topValue && y>grey_area_top && y<grey_area_top+valid_interval) {check_update();}
        }
    }
    else{
        if (document.documentElement.scrollTop == topValue && y>grey_area_top && y<grey_area_top+valid_interval) {check_update();}
    }

    function check_update(){
        d3.selectAll(".num").text(round+2);

        if (shuffled1.length == 0 && SHOW_STAR == false && weight_round == grey_area_height_ratio.length-1 && FLAG){
            is_timer_start = false;
            var temp_line_index = insert_symbol_line+1;
            round = update(round,begin,mouse_trace_back, temp_line_index, max_backtracking_distance, ratio, FLAG);
            FLAG = false;
            data = JSON.stringify(data);
            sessionStorage.setItem("scrolling_data", data);
            // location.href='./result.html';
            if (mode=='demo'){
                sendData2GoogleSheet(data);
                openPop(popend);
                $("#btn-back").click(function(){
                    sendData2GoogleSheet(data);
                    closePop(popend);
                    location.href='./legacy_code/result.html';
                })
                $("#btn-questionnaire").click(function(){
                    window.open("https://forms.gle/ob1KexoruTXrjZYy9");
                    sendData2GoogleSheet(data);
                    closePop(popend);
                    location.href='./info.html';
                })
            }
            else {
                openPop(popend);
                $("#btn-back").click(function(){
                    sendData2GoogleSheet(data);
                    closePop(popend);
                    location.href='./legacy_code/result.html';
                })
                $("#btn-questionnaire").click(function(){
                    window.open("https://docs.google.com/forms/d/e/1FAIpQLSeNe6CmGcnxC8h7EdvndWxIgWJWtSqiqyD5N_IGYOfG2K1G-w/viewform?pli=1");
                    sendData2GoogleSheet(data);
                    closePop(popend);
                    location.href='./legacy_code/result.html';
                })
            }
        }

        if (shuffled1.length == 0 && SHOW_STAR == false && weight_round < grey_area_height_ratio.length-1){
            shuffled1 = getNewShuffledArray();
            
            weight_round += 1;
            setGreyArea();
        }

        if (shuffled1.length == 0 && SHOW_STAR == true && weight_round == grey_area_height_ratio.length-1){
            shuffled1 = getNewShuffledArray();
            SHOW_NUM = true;
            SHOW_STAR = false;
            d3.select("#p-1").style("display","none");
            d3.select("#p-2").style("display","block");
            // alert("Now you will be told what line to scroll to, and there won't be any stars on that line.");
            openPop(popswitch);
            reset = true;
            d3.selectAll(".num").text(1);
            
            weight_round = 0;
            setGreyArea();
        }
        if (shuffled1.length == 0 && SHOW_STAR == true && weight_round < grey_area_height_ratio.length-1){
            shuffled1 = getNewShuffledArray();
            
            weight_round += 1;
            setGreyArea();
        }
        if (shuffled1.length > 0){
            is_timer_start = false;
            START_FLAG = false;
            d3.select(".group").remove();
            g = svg.append("g").classed("group", true);
            posY = 5;
            var temp_line_index = insert_symbol_line+1;
            insert_symbol_line = shuffled1.shift();
            add_shapes(insert_symbol_line, show_num=SHOW_NUM, show_star=SHOW_STAR);
            round = update(round,begin,mouse_trace_back, temp_line_index, max_backtracking_distance, ratio,FLAG);
            max_backtracking_distance = 0;
            if (SHOW_STAR == false){
                d3.select("#line_num").text(insert_symbol_line+1);
            }
            mouse_trace_back = -2;
            direction = -1;
            $("#svg-container").scrollTop(0);
            $("#grey_mask").show(); 
            openPop(popup);
            showGreyMask();
            clearInterval(interval);  
            interval = null; 
            
        }
        if (reset == true){
            round = 0;
        }
    }

        
    
}

// print each round data and save them
function update(round,start_time, mouse_trace_back,insert_symbol_line, max_backtracking_distance, ratio, FLAG){
    if (FLAG==true){
        round = round + 1;
        var end= parseInt(performance.now());
        var timeSpent= end-start_time;
        mouse_trace_back = Math.max(0,mouse_trace_back);

        var currentdate = new Date(); 
        var date =  currentdate.getDate() + "/"
                        + (currentdate.getMonth()+1)  + "/" 
                        + currentdate.getFullYear() + " "  
                        + currentdate.getHours() + ":"  
                        + currentdate.getMinutes() + ":" 
                        + currentdate.getSeconds();

        console.log("Round: "+ round);
        console.log("Time: "+ timeSpent);
        console.log("Line index: "+ insert_symbol_line);
        console.log("Trace back times: "+ parseInt(mouse_trace_back));
        console.log("Cumulative Distance: "+ parseInt(cum_distance));
        console.log("Max Back Tracking Distance: "+ parseInt(max_backtracking_distance));
        console.log("Ratio: "+ ratio);
        console.log("Date: "+ date);

        data["round"].push(round);
        data["time"].push(parseInt(timeSpent));
        data["target"].push(parseInt(insert_symbol_line));
        data["traceback"].push(parseInt(mouse_trace_back));
        data["cumDistance"].push(parseInt(cum_distance));
        data["maxbacktrack"].push(parseInt(max_backtracking_distance));
        data["ratio"].push(ratio);
        data["datetime"].push(date);

        cum_distance = 0;
        ratio = NaN;

        return round
    }
}

function scrollDistance (callback, refresh = 66) {
	if (!callback || typeof callback !== 'function') return;
	let isScrolling, start, end, distance;
	document.getElementById("svg-container").addEventListener('scroll', function (event) {
		if (!start) {
			start = $( "#svg-container" ).scrollTop();
		}
		window.clearTimeout(isScrolling);
		isScrolling = setTimeout(function() {
			end = $( "#svg-container" ).scrollTop();
			distance = end - start;
			callback(distance, start, end);
			start = null;
			end = null;
			distance = null;
		}, refresh);
	}, false);
}

function sendData2GoogleSheet(data){
    var info_data = JSON.parse(sessionStorage.getItem("info"));
    var data4json = [];
    var finaldata = JSON.parse(data);
    var round,time,target,traceback,cumDis,maxBacktrack;

    

    for (var i=0; i<finaldata["round"].length;i++){
        round = finaldata["round"][i];
        time = finaldata["time"][i];
        target = finaldata["target"][i];
        traceback = finaldata["traceback"][i];
        cumDis = finaldata["cumDistance"][i];
        maxBacktrack = finaldata["maxbacktrack"][i];
        ratio = finaldata["ratio"][i];
        datetime = finaldata["datetime"][i]
        data4json.push({ "ParticipantID":info_data["id"], "Scrolling_Technique":info_data["tech"], "Level_of_Experience":info_data["exp"].split("=")[0], 
                        "Mode":info_data["mode"], "Autoswitch":info_data["autoswitch"], "IP":info_data["ip"], "Detail":info_data["detail"],
                        "Round":round, "Time_(ms)":time, "Target_Line": target, "Num_Switchbacks": traceback,
                        "Cumulative_Distance_(px)":cumDis, "Max_Back_Track_Distance_(px)":maxBacktrack, "Ratio":ratio, "Date": datetime});
    }
    //save to google sheet
    //change the url
    const scriptURL = "https://script.google.com/macros/s/AKfycbyGBPIqOnbk3kybSnwHAqghPQx0mE5qo1qyKDHT3vl9GigrLDEyAg4RyF_BYTbtcHzt/exec?action=addData"
    fetch(scriptURL, { 
        method: 'POST', 
        headers: {
            'Content-Type': 'text/plain;charset=UTF-8'
        },
        body: JSON.stringify(data4json)
    })
}







