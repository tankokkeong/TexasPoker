// ========================================================================================
// Connect
// ========================================================================================
const param = $.param({ page: 'lobby' });

const con = new signalR.HubConnectionBuilder()
    .withUrl('/hub?' + param)
    .build();

$('#create').click(async e => {
    let gameId = await con.invoke('Create');
    location = `index.html?gameId=${gameId}`;
});

con.start().then(main);

function main() {
    $('#create').prop('disabled', false);
}