const username = sessionStorage.getItem("userName");

const conChat = new signalR.HubConnectionBuilder()
.withUrl('/pcChat?' + param)
.build(); 

function showChat() {
  document.getElementById("chats").style.cssText = "opacity: 1; transition: 0.5s;";
  document.getElementById("buttonOpenChat").style.cssText = "opacity: 0; transition: 0.5s;";
}

function closeChat() {
  document.getElementById("chats").style.cssText = "opacity: 0; transition: 0.5s;";
  document.getElementById("buttonOpenChat").style.cssText = "opacity: 1; transition: 0.5s;";
}

let countMsg = [];
let countSpam = 0;

function checkSpam(message) {
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
                          
          if(countSpam > 3) {
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

function removeSymbols(message) {
  message = message.replace(/[~*_]/g, '');
  return message;
}

// General Functions ==================================================
const m = $('#chat-content')[0];
let bottom = true;

function isBottom() {
  bottom = m.scrollTop + m.clientHeight + 10 >= m.scrollHeight;
}

function clearTextBox() {
  document.getElementById("message").value = "";
  document.getElementsByClassName("emojionearea-editor")[0].innerText = "";
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

// Connection Setup ===================================================
conChat.on('ReceiveText', (name, message, sentTime) => {
  message = checkSpam(message);

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
      $('#chat').append(`
        <div>
        <b>${sentTime}${name}</b>: ${message}
        </div>
      `);
      scrollToBottom();
  }
});

conChat.on('UpdateStatus', (count, status, name) => {
  $('#count').text(count);

  isBottom();
  $('#chat').append(`
      <div class="status">
          <div><b>${name}</b>${status}</div>
      </div>
  `);
  scrollToBottom();

  if(status === " joined game") {
    $('#modal-body1').append(`
        <p>
            <div id="${userID}">
                <i class="fas fa-circle"></i> ${name}
            </div>
        </p>
    `);
  } else {
    $("div").parent('p').remove();
  }
});

// TODO(2D): ReceiveImage(name, url, who)
conChat.on('ReceiveImage', (name, url, sentTime) => {
  isBottom();
  $('#chat').append(`
    <div>
        <b>${sentTime}${name}</b> sent an image<br>
        <img src="${url}" class="image" onload="scrollToBottom()">
    </div>
  `);
  scrollToBottom();
})

// TODO(3D): ReceiveYouTube(name, id, who)
conChat.on('ReceiveYouTube', (name, id, sentTime) => {
  isBottom();
  $('#chat').append(`
    <div>
        <b>${sentTime}${name}:</b> sent a video<br>
        <iframe width="250" height="150" 
            src="https://www.youtube.com/embed/${id}" 
            frameborder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen>
        </iframe>
    </div>
  `);
  scrollToBottom();
});

// Start ==============================================================
conChat.start().then(main);

function main() {
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
                          var time = today.getHours() + ":" + today.getMinutes();
                          let sentTime = "["+time+"] ";
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
                  } else if (webCamURL != "") {
                      let url = getImageURL(webCamURL);
                      conChat.invoke('SendImage', username, url, sentTime);
                  }
                  scrollToBottom();
              }
          },
      }
  });

  // TODO(4A): Request fullscreen
  $('#chat').on('click', '.image', e => e.target.requestFullscreen());

  // TODO(5A): File select
  $('#image').click(e => $('#file').click());

  var webCamURL = "";
  Webcam.set({
      width: 320,
      height: 240,
      image_format: 'jpeg',
      jpeg_quality: 90
  });       

  $('#takepic').on('click', function () {
      Webcam.attach('#my_camera');
  })
  
  $('#takePic').on('click', function () {                
      var today = new Date();
      var time = today.getHours() + ":" + today.getMinutes();
      let sentTime = "["+time+"] ";
      
      // take snapshot and get image data
      Webcam.snap(e => {
        conChat.invoke('SendImage', username, e, sentTime)
      });

      Webcam.reset('#camera');
      $("#closePic").trigger('click'); 
  })

  $('#closePic').on('click', function () {
      Webcam.reset('#camera');
  });

  $('#file').change(e => {
    let f = e.target.files[0];
    var today = new Date();
    var time = today.getHours() + ":" + today.getMinutes();
    let sentTime = "["+time+"] ";

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
    var time = today.getHours() + ":" + today.getMinutes();
    let sentTime = "["+time+"] ";

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