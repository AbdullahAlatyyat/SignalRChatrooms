"use strict";

var connection = new signalR.HubConnectionBuilder().withUrl("/chatHub").build();
const messages = document.getElementById('chat-room-body');
const roomsList = $('.chatAppBody')[0];
const usernameModal = $('#usernameModal');

$(document).ready(function () {
    let username = localStorage.getItem("username");
    if (!username) {
        usernameModal.modal('show');
    }
    else {
        $('#MyUsername').html(username);
    }
});

connection.on("ReceiveMessage", function (user, message, datetime) {
    appendMessage(user, message, datetime);
    scrollToBottom();
});

connection.on("RoomAdded", function (roomName) {
    appendRoom(roomName);
    roomEventListener();
});

function appendMessage(user, message, datetime) {
    let messageToAdd = '<div class="group-rom">';
    messageToAdd += `<div class="first-part odd"> ${user} </div>`;
    messageToAdd += `<div class="second-part"> ${message} </div>`;
    messageToAdd += `<div class="third-part"> ${datetime} </div>`;
    messageToAdd += '</div>';

    messages.innerHTML += messageToAdd;
}

function appendRoom(roomName) {
    let divAdd = `<li roomName="${roomName}">`;
    divAdd += '<a href="javascript:void(0);">';
    divAdd += '<i class="fa fa-rocket"></i>';
    divAdd += `<span> ${roomName} </span>`;
    divAdd += '</a>';
    divAdd += '</li>';

    roomsList.innerHTML += divAdd;
}

function scrollToBottom() {
    messages.scrollTop = messages.scrollHeight;
}

connection.start().then(function () {
    connection.invoke("GetRooms").then(function (result) {
        if (result != null) {
            for (var i = 0; i < result.length; i++) {
                let roomName = result[i];
                appendRoom(roomName);
            }
            roomEventListener();
        }
    }).catch(function (err) {
        return console.error(err.toString());
    });
}).catch(function (err) {
    return console.error(err.toString());
});

$('#sendButton').click(function () {
    let user = localStorage.getItem("username");
    let message = document.getElementById("messageInput").value;
    let room = $('#RoomName').html();
    $("#messageInput").val('');
    connection.invoke("SendMessage", user, message, room).catch(function (err) {
        return console.error(err.toString());
    });
});

function roomEventListener() {
    $('.chatAppBody > li').click(function () {
        let chanName = $(this).attr("roomName");
        connection.invoke("Join", chanName).then(function () {
            $('#RoomName').html(chanName);
            $('#chat-room-body').html('');
        }).catch(function (err) {
            return console.error(err.toString());
        });
    });
}

$('#usernameModal_submit').click(function () {
    let username = $('#modal_username').val();
    $('#modal_username').val('');
    localStorage.setItem("username", username);
    usernameModal.modal('hide');
});

$('#addChannelBtn').click(function () {
    $('#channelCreateModal').modal('show');
});

$('#channelCreateModal_submit').click(function () {
    let chanName = $('#modal_channelName').val();
    connection.invoke("AddRoom", chanName).then(function () {
        roomEventListener();
    }).catch(function (err) {
        return console.error(err.toString());
    });
    $('#modal_channelName').val('');
    $('#channelCreateModal').modal('hide');
});