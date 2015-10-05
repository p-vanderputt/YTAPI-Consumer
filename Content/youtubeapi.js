var wall;
var players = [];
var gutter = 16;
var numPlayersLoaded = 0;

$(function () {
    $("#search-button").click(function (e) {
        e.preventDefault();
        
        $(".overlay").show();
        $(".progress-bar").css("width", "0%");
        numPlayersLoaded = 0;

        // create request youtube api
        var request = gapi.client.youtube.search.list({
            part: "snippet",
            type: "video",
            q: encodeURIComponent($("#query").val()).replace(/%20/g, "+"),
            maxResults: 12
        });

        //execute request
        request.execute(function (response) {
            var results = response.result;
            $("#search-container").empty();
            wall = null;
            InitWall();
            
            while (players.length > 0) {
                var p = players.pop();
                p = null;
            }

            $.each(results.items, function (index, item) {
                var itemHTML = '<div class="free-item" data-width="400" data-height="300"><div class="video"></div></div>';

                wall.appendBlock(itemHTML);

                var theItem = $("#search-container").children(".free-item").last();

                theItem.children("div.video").attr("id", item.id.videoId);

                var player = CreateYTPlayer(item.id.videoId);
                players.push(player);
            });
        });
    });
    
    $("#loginBtn").click(function (e) {
        e.preventDefault();

        authenticateUser();
    });
});

function UpdateVideoHeight(){
    $(".video").each(function () {
        var width = $(this).parent().width();
        var height = width * 9 / 16;

        this.style.height = height + "px";
        this.style.width = width + "px";
    });
}

function init(){
    gapi.client.setApiKey("AIzaSyAINeTePwT3EKGQ98PM_Ap8EfZMsRlk-2s");
    gapi.client.load("youtube", "v3", function () {
        // api ready
        $('#search-button').attr('disabled', false);
        $('#loginBtn').attr('disabled', false);

        InitYTPlayerAPI();
    });
}

function authenticateUser(){
    gapi.auth.init(function () {
        gapi.auth.authorize({
            client_id: "228375627122-kdii63qt4pe7rtc7lcusl34f49vfpbnm.apps.googleusercontent.com",
            scope: ["https://www.googleapis.com/auth/youtube"],
            immediate: false
        }, handleAuth);
    });
}

function handleAuth(result){
    console.log(result);
    if (result && !result.error) {
        // user got logged in
        $("#loginBtn").css("display", "none");
    } else {
        // user didnt get logged in
    }
}

function InitYTPlayerAPI(){
    var tag = document.createElement('script');
    
    tag.src = "https://www.youtube.com/iframe_api";
    var firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
}

function CreateYTPlayer(id){
    var width = $("#" + id).parent().width();
    var height = width * 9 / 16;

    var player = new YT.Player(id,{
        height: height,
        width: width,
        videoId: id,
        events: {
            "onReady": function (e){
                numPlayersLoaded++;
                $(".progress-bar")[0].style.width = Math.floor((numPlayersLoaded / players.length) * 100) + "%";
                
                if (numPlayersLoaded == players.length) {
                    $(".overlay").hide();
                }
            },
            "onStateChange": function (e){
                if (e.data == YT.PlayerState.PLAYING || e.data == -1) {
                    if (!$(e.target.f).parent().hasClass("expanded")) {
                        ExpandPlayer(e);
                    }
                }
            }
        }
    });
    return player;
}

function ExpandPlayer(e){
    e.target.pauseVideo();

    for (var i in players) {
        if ($(".expanded>.video").attr("id") == players[i].f.id) {
            deflateWallItem($(".expanded"))
            players[i].pauseVideo();
            break;
        }
    }
    
    var wallItem = e.target.f.parentElement;

    var wwidth;
    var wheight;
    
    if ($("#search-container").attr("data-wall-width") > 1024) {
        wwidth = $("#search-container").attr("data-wall-width") * 2 / 3;
    } else {
        wwidth = $("#search-container").attr("data-wall-width");
    }
    $(wallItem).addClass("expanded");
    
    wheight = wwidth * 3 / 4
    
    $(wallItem).attr("data-width", wwidth);
    $(wallItem).attr("data-height", wheight);
    $(wallItem).css("width", wwidth + "px");
    $(wallItem).css("height", wheight + "px");
    
    wall.fitWidth();
    $(wallItem).css("height", wheight + "px");

    $(e.target.f).parent().one("transitionend", function () {
        e.target.playVideo();
    });
}

$(document).ready(function () {
    
});

function InitWall(){
    wall = new Freewall("#search-container");
    wall.reset({
        selector: ".free-item",
        fixSize: 0,
        cellW: cellWidth,
        cellH: cellHeight,
        gutterX: gutter,
        gutterY: gutter,
        animate: true,
        onResize: function (container) {
            var containerWidth = container[0].dataset.wallWidth;
            
            $(".expanded").each(function () {
                if (containerWidth > 1024) {
                    $(this).attr("data-width", containerWidth * 2 / 3);
                    $(this).css("width", (containerWidth * 2 / 3) + "px");
                } else {
                    $(this).attr("data-width", containerWidth);
                    $(this).css("width", containerWidth + "px");
                }
            });
            
            wall.fitWidth();
        }
    });
    wall.fitWidth();
}

function deflateWallItem(wallItem){
    var width, height;

    if ($("#search-container").attr("data-wall-width") > 1024) {
        width = $("#search-container").attr("data-wall-width") / 3;
    } else {
        width = $("#search-container").attr("data-wall-width") / 2;
    }
    wallItem.removeClass("expanded");
    
    height = width * 3 / 4;

    wallItem.attr("data-width", width);
    wallItem.attr("data-height", height);
    wallItem.css("width", width + "px");
    wallItem.css("height", height + "px");
}

function expandWallItem(wallItem){
    var width;
    if ($(wallItem).hasClass("expanded")) {
        
        if ($("#search-container").attr("data-wall-width") > 1024) {
            width = $("#search-container").attr("data-wall-width") / 3;
        } else {
            width = $("#search-container").attr("data-wall-width") / 2;
        }
        $(wallItem).removeClass("expanded");
    } else {
        
        if ($("#search-container").attr("data-wall-width") > 1024) {
            width = $("#search-container").attr("data-wall-width") * 2 / 3;
        } else {
            width = $("#search-container").attr("data-wall-width");
        }
        $(wallItem).addClass("expanded");
    }
    
    $(wallItem).attr("data-width", width);
    $(wallItem).attr("data-height", (width * 3 / 4));
    $(wallItem).css("width", width + "px");
    $(wallItem).css("height", (width * 3 / 4) + "px");
    
    wall.fitWidth();
    $(wallItem).css("height", (width * 3 / 4) + "px");
}

function cellWidth(containerWidth) {
    if (containerWidth > 1024) {
        return (containerWidth / 3) - (gutter * 2);
    } else if (containerWidth > 480) {
        return (containerWidth / 2) - gutter;
    } else {
        return containerWidth - gutter;
    }
}

function cellHeight() {
    if (document.documentElement.clientWidth > 1057) {
        return (((document.documentElement.clientWidth / 3) - (gutter * 2)) * 3 / 4);
    } else if (document.documentElement.clientWidth > 513) {
        return (((document.documentElement.clientWidth / 2) - gutter) * 3 / 4);
    } else {
        return ((document.documentElement.clientWidth - gutter) * 3 / 4);
    }
}

//function oldCode(){


//$.get("/Content/item.html", function (data) {

//    //$("#search-container").append(data);
//    wall.appendBlock(data);

//    var theItem = $("#search-container").children(".free-item").last();
//    theItem.click(clickWallItem);
//    //theItem.children("h4").text(item.snippet.title);
//    //theItem.children("iframe").attr("src", "http://www.youtube.com/embed/" + item.id.videoId).attr("id", item.id.videoId);
//    theItem.children("div.video").attr("id", item.id.videoId);

//    //var player = CreateYTPlayer(item.id.videoId);
//    //players.push(player);
//});



    //$(".expanded").removeClass("expanded col-xs-12 col-sm-12 col-md-8").addClass("col-xs-6 col-sm-6 col-md-4");
    //$(e.target.f).parent().addClass("expanded col-xs-12 col-sm-12 col-md-8").removeClass("col-xs-6 col-sm-6 col-md-4");

    //$(".expanded").removeClass("expanded");
    //$(e.target.f).parent().addClass("expanded");

    //var w = $(e.target.f).parent().width();
    //var h = w * 9 / 16;


    //UpdateVideoHeight();
    //$(e.target.f).stop().animate({
    //    height: h,
    //    width: w
    //}, {
    //    duration: 500,
    //    complete: function () {
    //        e.target.playVideo();
    //    }
    //});

    //e.target.f.style.height = h + "px";
    //e.target.f.style.width = w + "px";
    //$(e.target.f).one("transitionend", function () {
    //    e.target.playVideo();
    //});
//}