var info_data = JSON.parse(sessionStorage.getItem("info"));
$("#name_val").text(info_data["username"]);
$("#id_val").text(info_data["id"]);
$("#tech_val").text(info_data["tech"]);
$("#exp_val").text(info_data["exp"]);

var data = JSON.parse(sessionStorage.getItem("scrolling_data"))
//init container
var div = $("<div>").addClass("key-value-pair");
var label_key = $("<label>").addClass("key");
var label_value = $("<label>").addClass("value"); 
var round,time,target,traceback,cumDis,maxBacktrack; 
var total_time_1 = 0;
var total_num_switchback_1 = 0;
var total_cum_dis_1 = 0;
var total_time_2 = 0;
var total_num_switchback_2 = 0;
var total_cum_dis_2 = 0;
var data4json = [];

//set csv header
var data4csv = [{ "User":"User", "AndrewID":"AndrewID", "Participant_Type":"Participant Type",
                    "Scrolling_Technique":"Scrolling Technique", "Detail":"Detail", "Level_of_Experience":"Level of Experience", "Mode":"Mode",
                    "Round":"Round", "Time_(ms)":"Time (ms)", "Target_Line": "Target Line", "Num_Switchbacks": "Num Switchbacks",
                    "Cumulative_Distance_(px)":"Cumulative Distance (px)", "Max_Back_Track_Distance":"Max Back Track Distance (px)"}]; 

function refresh_container(){
    div = $("<div>").addClass("key-value-pair");
    label_key = $("<label>").addClass("key");
    label_value = $("<label>").addClass("value"); 
}

function append_data(key, value){
    label_key.text(key);
    label_value.text(value);
    label_key.appendTo(div);
    label_value.appendTo(div);
    $("<br>").appendTo(div);
    $("#show_data").append(div);
    refresh_container();
}

for (var i=0; i<data["round"].length;i++){
    round = data["round"][i];
    time = data["time"][i];
    target = data["target"][i];
    traceback = data["traceback"][i];
    cumDis = data["cumDistance"][i];
    maxBacktrack = data["maxbacktrack"][i];

    append_data("Round", round);
    append_data("Time (ms)", time);
    append_data("Target Line", target);
    append_data("Num Switchbacks", traceback);
    append_data("Cumulative Distance (px)", cumDis);
    append_data("Max Back Track Distance (px)", maxBacktrack); 

    if (i<data["round"].length/2){
        total_time_1 = total_time_1 + time;
        total_num_switchback_1 = total_num_switchback_1 + traceback;
        total_cum_dis_1 = total_cum_dis_1 + cumDis;
    }
    else{
        total_time_2 = total_time_2 + time;
        total_num_switchback_2 = total_num_switchback_2 + traceback;
        total_cum_dis_2 = total_cum_dis_2 + cumDis;
    }

    data4json.push({ "User":info_data["username"], "AndrewID":info_data["id"], "Participant_Type":info_data["type"],
                    "Scrolling_Technique":info_data["tech"], "Detail":info_data["detail"], "Level_of_Experience":info_data["exp"].split("=")[0], "Mode":info_data["mode"],
                    "Round":round, "Time_(ms)":time, "Target_Line": target, "Num_Switchbacks": traceback,
                    "Cumulative_Distance_(px)":cumDis, "Max_Back_Track_Distance_(px)":maxBacktrack});
}

$("#total_time_1").text(total_time_1);
$("#total_num_backtrack_1").text(total_num_switchback_1 );
$("#total_cum_dis_1").text(total_cum_dis_1);
$("#total_time_2").text(total_time_2);
$("#total_num_backtrack_2").text(total_num_switchback_2);
$("#total_cum_dis_2").text(total_cum_dis_2);


var summary_data = {"phase_1":{"total_time":total_time_1, "total_num_switchback":total_num_switchback_1, "total_cum_dis": total_cum_dis_1}, 
                    "phase_2":{"total_time":total_time_2, "total_num_switchback":total_num_switchback_2, "total_cum_dis": total_cum_dis_2}}

for (var j=0; j<data4json.length; j++){
    data4csv.push(data4json[j]);
}

//save to google sheet
const scriptURL = "https://script.google.com/macros/s/AKfycbyGBPIqOnbk3kybSnwHAqghPQx0mE5qo1qyKDHT3vl9GigrLDEyAg4RyF_BYTbtcHzt/exec?action=addData"
fetch(scriptURL, { method: 'POST', body: JSON.stringify(data4json)})

//download JSON file
jsonData = {"all_data":data4json, "summary_data": summary_data};
function download(content, fileName, contentType) {
    const a = document.createElement("a");
    const file = new Blob([content], { type: contentType });
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
}

$("#toJSON").click(function(){
    download(JSON.stringify(jsonData), "scrolling-test-json-data.json", "text/plain");
});

//download CSV file
function JSON2CSV(objArray, summary_header, summary_data) {
    var array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
    var str = '';
    var line = '';
    if ($("#labels").is(':checked')) {
        var head = array[0];
        if ($("#quote").is(':checked')) {
            for (var index in array[0]) {
                var value = index + "";
                line += '"' + value.replace(/"/g, '""') + '",';
            }
        } else {
            for (var index in array[0]) {
                line += index + ',';
            }
        }
        line = line.slice(0, -1);
        str += line + '\r\n';
    }
    for (var i = 0; i < array.length; i++) {
        var line = '';
        if ($("#quote").is(':checked')) {
            for (var index in array[i]) {
                var value = array[i][index] + "";
                line += '"' + value.replace(/"/g, '""') + '",';
            }
        } else {
            for (var index in array[i]) {
                line += array[i][index] + ',';
            }
        }
        line = line.slice(0, -1);
        str += line + '\r\n';
    }
    
    str += '\r\n';
    var tmp_line = ""
    summary_header.forEach(element => {
        tmp_line += element + ",";
    });
    tmp_line.slice(0,-1);
    str += tmp_line + '\r\n'

    tmp_line = ""
    summary_data.forEach(element => {
        tmp_line += (element) + ",";
    });
    tmp_line.slice(0,-1);
    str += tmp_line + '\r\n'
    return str;
}

$("#toCSV").click(function(){
    var json = data4csv;
    var summary_header = [  "total time for scroll test phase 1", 
                            "total number of backtracks for phase 1", 
                            "total cumulative distance for phase 1",
                            "total time for scroll test phase 2", 
                            "total number of backtracks for phase 2", 
                            "total cumulative distance for phase 2"];
    var summary_data = [total_time_1, total_num_switchback_1, total_cum_dis_1, 
                        total_time_2, total_num_switchback_2, total_cum_dis_2]
    var csv = JSON2CSV(json, summary_header, summary_data);
    var downloadLink = document.createElement("a");
    var blob = new Blob(["\ufeff", csv]);
    var url = URL.createObjectURL(blob);
    downloadLink.href = url;
    downloadLink.download = "scrolling-test-csv-data.csv";
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
});