var inputArray = [false, false, false, false];

$(document).ready(function(){
    if ($("#participantId").val() != "" && $("#tech").val() != "" && $("#experience").val() != "" && $("#username").val() != ""){
        inputArray = [true, true, true, true];
        enableBtn(inputArray);
    };
});

var info_data = JSON.parse(sessionStorage.getItem("info"))
if (info_data != null){
    $("#participantId").val(info_data["id"])
    inputArray[0] = true;
    enableBtn(inputArray);
}


$("#participantId").on("input", function () {
    inputArray[0] = true;
    enableBtn(inputArray);
});
$("#tech").on("change", function () {
    inputArray[1] = true;
    enableBtn(inputArray);
    if ($("#tech").val() == 'other'){
        console.log("add new text box");
        $("#enter-detail").css("display", "block");
    }
    else{
        $("#enter-detail").css("display", "none");
    }
});
$("#experience").on("change", function () {
    inputArray[2] = true;
    enableBtn(inputArray);
});
$("#username").on("input", function () {
    inputArray[3] = true;
    enableBtn(inputArray);
});

function enableBtn(array){
    enable = true;
    for (var i = 0; i<4; i++){
        if (array[i] == false){
            enable = false;
        }
    }
    if (enable==true){
        $(".btn-main").css("background-color","black");
        $(".btn-main").removeAttr("disabled");
    }
}

function getValue(mode){
    var id = $("#participantId").val();
    var name = $("#username").val();
    var tech = $("#tech").val();
    var experience = $("#experience").val();
    var autoswitch = $("#autoswitch").val();
    var d;
    if ($("#enter-detail").css("display") == "none"){
        d = {"id":id, "tech":tech, "exp":experience, "autoswitch": autoswitch, "username":name}
    }
    else{
        d = {"id":id, "tech":tech, "exp":experience, "autoswitch": autoswitch, "username":name}
    }
    var value;
    $.ajax({
        url: "//api.ipify.org/?format=json",
        dataType: 'JSON',
        success: function(data) {
            d["ip"] = data.ip
            value =  JSON.stringify(d);
            console.log(value)
            sessionStorage.setItem("info", value)
            location.href='./scrolling-test.html?mode='+mode
        },
        error: function (jqXHR, textStatus, errorThrown) {
            d["ip"] = "fail to get ip"
            // console.log(jqXHR);
            // console.log(textStatus);
            // console.log(errorThrown);
            value =  JSON.stringify(d);
            console.log(value)
            sessionStorage.setItem("info", value);
            location.href='./scrolling-test.html?mode='+mode
        }
    })
}

$("#btn-demo").click(function(){
    getValue('demo');
    //location.href='./scrolling-test.html?mode=demo'
})
$("#btn-formal").click(function(){
    getValue('formal');
    //location.href='./scrolling-test.html?mode=formal'
})