var socket;
var name;

var canvas;
var renderer;
var camera;
var scene;

$(document).ready(function () {
    //set the height to be the clientHeight
    $(".scrollArea").css({ "height": (document.documentElement.clientHeight - $("#chat>input").height() - 6 - 32) + "px" });
    
    //name = prompt("Enter your name.");
    name = "Anonymous";
    socket = io({ query: "name=" + name });

    socket.on("chat message", function (name, message) {
        $("#chatBox").append($("<p></p>").text(message).prepend($("<strong></strong>").text(name + ": "))).scrollTop($("#chatBox")[0].scrollHeight);
    });

    socket.on("notice me", function (name) {
        $("#chatBox").append($("<p></p>").append($("<em></em>").text(name + " joined the room."))).scrollTop($("#chatBox")[0].scrollHeight);
    });

    $("#chat").submit(function () {
        socket.emit("chat message", name, $("#userMessage").val());
        $("#chatBox").append($("<p></p>").text($("#userMessage").val()).prepend($("<strong></strong>").text(name + ": "))).scrollTop($("#chatBox")[0].scrollHeight);
        $("#userMessage").val("").focus();
        return false;
    });
    
    $(window).resize(function () {
        $(".scrollArea").css({ "height": (document.documentElement.clientHeight - $("#chat>input").height() - 6 - 32) + "px" });
    });


    Twitch.init({ clientId: 'sy7kuj108htubcvq9gz11hkf6ntc60y' }, function (error, status) {
        if (status.authenticated) {
            $('.twitch-connect').hide()
            // we're logged in :)
            $('.status input').val('Logged in! Allowed scope: ' + status.scope);
            // Show the data for logged-in users
            $('.authenticated').removeClass('hidden');
        } else {
            $('.status input').val('Not Logged in! Better connect with Twitch!');
            // Show the twitch connect button
            $('.authenticate').removeClass('hidden');
        }
    });

    $('.twitch-connect').click(function () {
        Twitch.login({
            scope: ['user_read', 'channel_read']
        });
    });

    $('#logout button').click(function () {
        Twitch.logout();
        
        // Reload page and reset url hash. You shouldn't
        // need to do this.
        window.location = window.location.pathname
    });

    $('#get-name button').click(function () {
        Twitch.api({ method: 'user' }, function (error, user) {
            $('#get-name input').val(user.display_name);
        });
    });
    
    $('#get-stream-key button').click(function () {
        Twitch.api({ method: 'channel' }, function (error, channel) {
            $('#get-stream-key input').val(channel.stream_key);
        });
    });

});

