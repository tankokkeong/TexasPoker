// ========================================================================================
// Connect
// ========================================================================================
const param = $.param({ page: 'lobby' });

const username = sessionStorage.getItem("userName");
const userID = sessionStorage.getItem("userId");

const con = new signalR.HubConnectionBuilder()
    .withUrl('/hub?' + param)
    .build();

$('#create').click(async e => {
    let gameId = await con.invoke('Create');
    location = `room.html?gameId=${gameId}`;
});

con.start().then(main);

con.on('UpdateList', list => {
    let html = '';

    for (let game of list) {
        html += `
            <tr>
                <td>${game.id}</td>
                <td>${game.playerA.icon} ${game.playerA.name}</td>
                <td><button data-join="${game.id}">Join</button></td>
            </tr>
        `;
    }

    if (list.length == 0) {
        html = '<tr><td colspan="5">No game</td></tr>';
    }

    $('#pokerGameList').html(html);
});

function main(){
    $('#create').prop('disabled', false);
}

// Chat Feature =====================================================

let countMsg = [];
let countSpam = 0;

function checkSpam(message, who) {
    try{
        if(message) {
            countMsg.push(message);
            if(countMsg.values().next().value.toLowerCase() == message.toLowerCase()){
                countSpam++;   
            } else {
                countMsg = [];
                countMsg.push(message);
                countSpam = 1;
            }
                            
            if(countSpam > 3 && who === "caller") {
                alert("Please Do Not Spam !!")
            }
            return message;
        }
    } catch{

    }

    return null;
}

function cleanMessage(message){
    var bad_words = badWords;
    let chat = message;
    var error = 0;

    for(var i = 0; i < bad_words.length; i++) {
        var val = bad_words[i];
        if((chat.toLowerCase()).indexOf(val.toString()) == 0){
            error++;
            chat = chat.toLowerCase().replaceAll(bad_words[i].toLowerCase().toString(), "<i>--Bad Word Detected--</i>")
        }
    }
    return chat;
}

function symbols(message) {
    var hasSymbols = false;

    while(hasSymbols != true) {
        if(message.match(/[\*]/g)){
            message = message.replaceAll(/\*[\s\S]*\*/gi, '<b>' + message + '</b>');
            message = message.replace(/[\*]/g, '');
        } else if(message.match(/[\~]/g)) {
            message = message.replaceAll(/~[\s\S]*~/gi, '<i>' + message + '</i>');
            message = message.replace(/[\~]/g, '');
        } else if(message.match(/[\_]/g)) {
            message = message.replaceAll(/_[\s\S]*_/gi, '<u>' + message + '</u>');
            message = message.replace(/[\_]/g, '');
        } else {
            return message;
        }
        hasSymbols = !checkSymbols(message);
    }
    return message; 
}

function checkSymbols(message) {
    var checked = false;

    if(message.match(/[~*_]/g)){
        return checked = true;
    }

    return checked;
}

$('#myTab a').on('click', function (e) {
    e.preventDefault();
    $(this).tab('show');
})

const conChat = new signalR.HubConnectionBuilder()
.withUrl('/gChat')
.build();

// General Functions ==================================================
const m = $('#messages')[0];
let bottom = true;

function isBottom() {
    bottom = m.scrollTop + m.clientHeight + 10 >= m.scrollHeight;
}

function scrollToBottom() {
    if (bottom) {
        m.scrollTop = m.scrollHeight;
    }
}

function clearTextBox() {
    document.getElementById("message").value = "";
    document.getElementsByClassName("emojionearea-editor")[0].innerText = "";
}

// TODO(3A): getYouTubeId(message) --> id
function getYouTubeId(message) {
    try{
        let url = new URL(message);
        if(url.hostname == 'www.youtube.com' && url.pathname == '/watch') {
            return url.searchParams.get('v');
        }
    }catch {
        // Do Nothing
    }

    return null;
}

// TODO(2A): getImageURL(message) --> url
function getImageURL(message) {
    let re = /.(jpg|jpeg|png|webp|gif|bmp)$/i;
    try {
        let url = new URL(message);
        if(re.test(url.pathname)) {
            return url.href;
        }
    } catch {
        // Do nothing
    }

    return null;
}

// Connection Setup ===================================================
conChat.on('ReceiveText', (name, message, who, sentTime) => {
    message = checkSpam(message, who);

    if(countSpam < 4) {
        message = cleanMessage(message);  
        if(checkSymbols(message)){
            message = symbols(message);
        }
    
        // message = $('<div>').text(message).html();
        
        // TODO(1): Text-to-hyperlink transform
        message = message.replace(
            /(?<=^|\s)(https?:\/\/\S+)(?=$|\s)/gi, 
            '<a href="$&" target="_blank">$&</a>'
            );

        isBottom();
        $('#messages').append(`
            <div class="${who}">
                <b>${name}:</b> ${message}
                <p>Sent Time : ${sentTime}</p>
            </div>
        `);
        scrollToBottom();
    }
});

// TODO(2D): ReceiveImage(name, url, who)
conChat.on('ReceiveImage', (name, url, who, sentTime) => {
    isBottom();
    $('#messages').append(`
        <div class="${who}">
            <b>${name}</b> sent an image<br>
            <img src="${url}" class="image" onload="scrollToBottom()">
            <p>Sent Time : ${sentTime}</p>
        </div>
    `);
    scrollToBottom();
})

conChat.on('UpdateStatus', (count, status, name, playerId) => {
    $('#count').text(count);

    isBottom();
    $('#messages').append(`
        <div class="status">
            <div><b>${name}</b>${status}</div>
        </div>
    `);
    scrollToBottom();

    if(status === " joined") {
        $('#modal-body1').append(`
            <div id="${playerId}">
                <i class="fas fa-circle"></i> ${name}
            </div>
        `);
    } else if (status === " left" || status === "") {
        $('#' + playerId).css("display", "none");
        document.cookie = `userID=${playerId}; expires=Thu, 01 Jan 1970 00:00:00 UTC;`;
    }
});

// TODO(3D): ReceiveYouTube(name, id, who)
conChat.on('ReceiveYouTube', (name, id, who, sentTime) => {
    isBottom();
    $('#messages').append(`
        <div class=${who}>
            <b>${name}:</b> sent a video<br>
            <iframe width="400" height="300" 
                src="https://www.youtube.com/embed/${id}" 
                frameborder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen>
            </iframe>
            <p>Sent Time : ${sentTime}</p>
        </div>
    `);
    scrollToBottom();
});

// Start ==============================================================
conChat.start().then(chat);

function chat() {
    $("#message").emojioneArea({
        pickerPosition: "top",
        inline: true,
        events: {
            keyup: function (editor, event) {
                if (event.which == 13) {
                    isBottom();

                    if (message != "") {
                        let message = $('#message').val().trim() || $('.emojionearea-editor')[0].innerHTML;
                        if (message) {
                            var today = new Date();
                            var date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
                            var time = today.getHours() + ":" + today.getMinutes();
                            let sentTime = time + ' ' + date;
                            let url = getImageURL(message);
                            let id  = getYouTubeId(message);

                            if (url) {
                                // Send image
                                conChat.invoke('SendImage', username, url, sentTime);
                            }
                            else if (id) {
                                // Send YouTube
                                conChat.invoke('SendYouTube', username, id, sentTime);
                            }
                            else {
                                // Send text
                                conChat.invoke('SendText', username, message, sentTime);
                            }
                            //Clear textbox after sending the message
                            clearTextBox();
                        }
                        $('#message').val('').focus();
                        scrollToBottom();
                    }
                }
            },
        }
    });

    // TODO(4A): Request fullscreen
    $('#messages').on('click', '.image', e => e.target.requestFullscreen());

    // TODO(5A): File select
    $('#image').click(e => $('#file').click());

    $('#file').change(e => {
        let f = e.target.files[0];
        var today = new Date();
        var date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
        var time = today.getHours() + ":" + today.getMinutes();
        let sentTime = time + ' ' + date;

        if(f && f.type.startsWith('image/')) {
            fit(f, 500, 500, 'dataURL', 'image/webp').then(url => conChat.invoke('SendImage', username, url, sentTime));
        }

        e.target.value = null;
    });

    // TODO(6B): Drag-and-drop file select
    $('#messages').on('dragenter dragover', e => {
        e.preventDefault();
        $('#messages').addClass('active');
    });

    $('#messages').on('dragleave drop', e => {
        e.preventDefault();
        $('#messages').removeClass('active');
    });
    
    $('#messages').on('drop', e => {
        e.preventDefault();
        let f = e.originalEvent.dataTransfer.files[0];
        
        var today = new Date();
        var date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
        var time = today.getHours() + ":" + today.getMinutes();
        let sentTime = time + ' ' + date;

        if(f && f.type.startsWith('image/')) {
            fit(f, 500, 500, 'dataURL', 'image/webp').then(url => conChat.invoke('SendImage', username, url, sentTime));
        }
    });
}   

// PURPOSE: Center-crop image to the width and height specified (upscale)
function crop(f, w, h, to = 'blob', type = 'image/jpeg') {
    return new Promise((resolve, reject) => { 
        const img = document.createElement('img');
        
        img.onload = e => {
            URL.revokeObjectURL(img.src);
            
            // Resize algorithm ---------------------------
            let ratio = w / h;

            let nw = img.naturalWidth;
            let nh = img.naturalHeight;
            let nratio = nw / nh;

            let sx, sy, sw, sh;

            if (ratio >= nratio) {
                // Retain width, calculate height
                sw = nw;
                sh = nw / ratio;
                sx = 0;
                sy = (nh - sh) / 2;
            }
            else {
                // Retain height, calculate width
                sw = nh * ratio;
                sh = nh;
                sx = (nw - sw) / 2;
                sy = 0;
            }
            // --------------------------------------------

            const can = document.createElement('canvas');
            can.width  = w;
            can.height = h;
            can.getContext('2d').drawImage(img, sx, sy, sw, sh, 0, 0, w, h);

            // Resolve to blob or dataURL
            if (to == 'blob') {
                can.toBlob(blob => resolve(blob), type);
            }
            else if (to == 'dataURL') {
                let dataURL = can.toDataURL(type);
                resolve(dataURL);
            }
            else {
                reject('ERROR: Specify blob or dataURL');
            }
        };

        img.onerror = e => {
            URL.revokeObjectURL(img.src);
            reject('ERROR: File is not an image');
        };

        img.src = URL.createObjectURL(f);
    });
}

// PURPOSE: Best-fit image within the width and height specified (no upscale)
function fit(f, w, h, to = 'blob', type = 'image/jpeg') {
    return new Promise((resolve, reject) => { 
        const img = document.createElement('img');
        
        img.onload = e => {
            URL.revokeObjectURL(img.src);
            
            // Resize algorithm ---------------------------
            let ratio = w / h;

            let nw = img.naturalWidth;
            let nh = img.naturalHeight;
            let nratio = nw / nh;

            if (nw <= w && nh <= h) {
                // Smaller than targetted width and height, do nothing
                w = nw;
                h = nh;
            }
            else {
                if (nratio >= ratio) {
                    // Retain width, calculate height
                    h = w / nratio;
                }
                else {
                    // Retain height, calculate width
                    w = h * nratio;
                }
            }
            // --------------------------------------------

            const can = document.createElement('canvas');
            can.width  = w;
            can.height = h;
            can.getContext('2d').drawImage(img, 0, 0, w, h);

            // Resolve
            if (to == 'blob') {
                can.toBlob(blob => resolve(blob), type);
            }
            else if (to == 'dataURL') {
                let dataURL = can.toDataURL(type);
                resolve(dataURL);
            }
            else {
                reject('ERROR: Specify blob or dataURL');
            }
        };

        img.onerror = e => {
            URL.revokeObjectURL(img.src);
            reject('ERROR: File is not an image');
        };

        img.src = URL.createObjectURL(f);
    });
}

function setCookie(cname, cvalue, exdays) {
    const d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    let expires = "expires="+ d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for(let i = 0; i <ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

function checkCookie(username) {
    let checkUsername = getCookie("userID");
    if (checkUsername != "" && checkUsername == username) {
        document.cookie = "userID=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        setCookie("userID", username, 365);
    } else {
        checkUsername = username;
        if (username != "" && username != null) {
            setCookie("userID", username, 365);
        }
    }
}

checkCookie(userID);

// ========================================================================================
// Mini Game Events
// ========================================================================================
$('#createMini').click(async e => {
    let gameId = await conn.invoke('Create');
    location = `mini-game.html?gameId=${gameId}`;
});

$('#gamelist').on('click', '[data-join]', e => {
    let gameId = $(e.target).data('join');
    location = `mini-game.html?gameId=${gameId}`;
});

// ========================================================================================
// Mini Game Connect
// ========================================================================================
const conn = new signalR.HubConnectionBuilder()
.withUrl('/minigameHub?' + param)
.build();

conn.on('UpdateList', (list) => {
    let html = '';
    let no = 1;

    for (let game of list){
        html += `
            <tr>
                <td>${no}</td>
                <td>${game.playerA.name}</td>
                <td><button data-join="${game.id}" class="btn btn-primary">Join Game</button></td>
            </tr>
        `;
        no++;
    }

    if(list.length == 0){
        html = '<tr><td colspan="3">No game is available now</td></tr>';
    }

    $('#gamelist').html(html);

});


conn.start().then(miniMain);

function miniMain(){
    $('#createMini').prop('disabled', false);
}