// ========================================================================================
// Connect
// ========================================================================================

const param = $.param({ page: 'game', icon, name, gameId });

const con = new signalR.HubConnectionBuilder()
.withUrl('/hub?' + param)
.build();

$('#create').click(async e => {
    let gameId = await con.invoke('Create');
    location = `game.html?gameId=${gameId}`;
});