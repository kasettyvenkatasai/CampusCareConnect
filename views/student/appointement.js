var timebeforenotify =0 
document.getElementById("fifm").onclick = function(){
    timebeforenotify=15
}
document.getElementById("thirm").onclick = function(){
    timebeforenotify=30
}
document.getElementById("sixmm").onclick = function(){
    timebeforenotify=60
}
module.exports={timebeforenotify}