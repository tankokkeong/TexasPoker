// ========================================================================================
// Connect
// ========================================================================================
const param = $.param({ page: 'lobby' });

const username = sessionStorage.getItem("userName");

const con = new signalR.HubConnectionBuilder()
    .withUrl('/hub?' + param)
    .build();

$('#create').click(async e => {
    let gameId = await con.invoke('Create');
    location = `room.html?gameId=${gameId}`;
});

con.start().then(main);

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
conChat.on('ReceiveText', (name, message, who) => {
    message = message
        .replaceAll(':)', '😊')
        .replaceAll(':(', '😥')
        .replaceAll('<3', '❤️');
    
    message = $('<div>').text(message).html();
    
    // TODO(1): Text-to-hyperlink transform
    message = message.replace(
        /(?<=^|\s)(https?:\/\/\S+)(?=$|\s)/gi, 
        '<a href="$&" target="_blank">$&</a>'
        );

    isBottom();
    $('#messages').append(`
        <div class="${who}">
            <b>${name}:</b> ${message}
        </div>
    `);
    scrollToBottom();
});

// TODO(2D): ReceiveImage(name, url, who)
conChat.on('ReceiveImage', (name, url, who) => {
    isBottom();
    $('#messages').append(`
        <div class="${who}">
            <b>${name}</b> sent an image<br>
            <img src="${url}" class="image" onload="scrollToBottom()">
        </div>
    `);
})

conChat.on('UpdateStatus', (count, status) => {
    $('#count').text(count);

    isBottom();
    $('#chat').append(`
        <li class="status">
            <div>${status}</div>
        </li>
    `);
    scrollToBottom();
});

// Start ==============================================================
conChat.start().then(chat);

function main(){
    $('#create').prop('disabled', false);
}

function chat() {    
    $('#form').submit(e => {
        e.preventDefault();
        let message = $('#message').val().trim();
        if (message) {
            // TODO(2B): url <-- getImageURL(message)
            let url = getImageURL(message);

            if (url) {
                // Send image
                conChat.invoke('SendImage', username, url);
            }
            else {
                // Send text
                conChat.invoke('SendText', username, message);
            }
        }
        $('#message').val('').focus();
    });

    // TODO(4A): Request fullscreen
    $('#messages').on('click', '.image', e => e.target.requestFullscreen());

    // TODO(5A): File select
    $('#image').click(e => $('#file').click());

    $('#file').change(e => {
        let f = e.target.files[0];

        if(f && f.type.startsWith('image/')) {
            fit(f, 500, 500, 'dataURL', 'image/webp').then(url => conChat.invoke('SendImage', username, url));
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

        if(f && f.type.startsWith('image/')) {
            fit(f, 500, 500, 'dataURL', 'image/webp').then(url => conChat.invoke('SendImage', username, url));
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

// ========================================================================================
// Mini Game Events
// ========================================================================================
$('#createMini').click(async e => {

    let minigameId = await conMini.invoke('Create');
    location = `minigame.html?gameId=${minigameId}`;
});

$('.gamelist').on('click', '[data-join]', e => {
    let minigameId = $(e.target).data('join');
    location = `minigame.html?gameId=${minigameId}`;
});

// ========================================================================================
// Mini Game Connect
// ========================================================================================

const conMini = new signalR.HubConnectionBuilder()
.withUrl('/minigameHub?' + param)
.build();

conMini.on('UpdateList', list => {
    let html = '';

    for (let game of list){
        html += `
            <tr>
                <td>${game.id}</td>
                <td>${game.playerA.name}</td>
                <td>0/5</td>
                <td><button data-join="${game.id}">Join</button></td>
            </tr>
        `;
    }

    if(list.length == 0){
        html = '<tr><td colspan="3">No game</td></tr>';
    }

    $('.gamelist').html(html);

});

conMini.start().then(miniMain);

function miniMain(){
    $('#createMini').prop('disabled', false);
}