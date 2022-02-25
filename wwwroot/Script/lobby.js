// ========================================================================================
// Connect
// ========================================================================================
const param = $.param({ page: 'lobby' });

const username = 'alex';

const con = new signalR.HubConnectionBuilder()
    .withUrl('/hub?' + param)
    .build();

$('#create').click(async e => {
    let gameId = await con.invoke('Create');
    location = `index.html?gameId=${gameId}`;
});

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
con.on('ReceiveText', (name, message, who) => {
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
        <li class="${who}">
            <div>
                <b>${name}:</b> ${message}
            </div>
        </li>
    `);
    scrollToBottom();
});

con.on('UpdateStatus', (count, status) => {
    $('#count').text(count);

    isBottom();
    $('#messages').append(`
        <li class="status">
            <div>${status}</div>
        </li>
    `);
    scrollToBottom();
});

// TODO(2D): ReceiveImage(name, url, who)
con.on('ReceiveImage', (name, url, who) => {
    isBottom();
    $('#messages').append(`
        <li class="${who}">
            <div>
                <b>${name}</b> sent an image<br>
                <img src="${url}" class="image" onload="scrollToBottom()">
            </div>
        </li>
    `);
})

// Start ==============================================================
con.start().then(main);

function main() {
    $('#create').prop('disabled', false);
    
    $('#form').submit(e => {
        e.preventDefault();
        let message = $('#message').val().trim();
        if (message) {
            // TODO(2B): url <-- getImageURL(message)
            let url = getImageURL(message);

            if (url) {
                // Send image
                con.invoke('SendImage', username, url);
            }
            else {
                // Send text
                con.invoke('SendText', username, message);
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
            fit(f, 500, 500, 'dataURL', 'image/webp').then(url => con.invoke('SendImage', username, url));
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
            fit(f, 500, 500, 'dataURL', 'image/webp').then(url => con.invoke('SendImage', username, url));
        }
    });
}