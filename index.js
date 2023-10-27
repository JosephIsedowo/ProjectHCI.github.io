var inputArray = [false, false, false];
var ans1 = 0, ans2 = 0, ans3 = 0;

$(document).ready(function(){
    if (($("input[name='q1']:checked").val() == 1) && ($("input[name='q2']:checked").val() == 1) && ($("input[name='q3']:checked").val() == 1)){
        inputArray = [true, true, true];
        enableBtn(inputArray);
    }
})

$(".q1").on("change", function(){
    ans1 = $("input[name='q1']:checked").val();
    if (ans1 == 1){
        inputArray[0] = true;
        enableBtn(inputArray);
    } 
    else{
        inputArray[0] = false;
        disableBtn(inputArray);
    }
})

$(".q2").on("change", function(){
    ans2 = $("input[name='q2']:checked").val();
    if (ans2 == 1){
        inputArray[1] = true;
        enableBtn(inputArray);
    } 
    else{
        inputArray[1] = false;
        disableBtn(inputArray);
    }
})

$(".q3").on("change", function(){
    ans3 = $("input[name='q3']:checked").val();
    if (ans3 == 1){
        inputArray[2] = true;
        enableBtn(inputArray);
    } 
    else{
        inputArray[2] = false;
        disableBtn(inputArray);
    }
    
})

function enableBtn(array){
    enable = true;
    for (var i = 0; i<3; i++){
        if (array[i] == false){
            enable = false;
        }
    }
    if (enable==true){
        $(".btn-main").css("background-color","black");
        $(".btn-main").removeAttr("disabled");
    }
}

function disableBtn(array){
    $(".btn-main").css("background-color","rgb(187, 187, 187)");
    $(".btn-main").prop("disabled",true);
}