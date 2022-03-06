using Microsoft.AspNetCore.SignalR;
public class chatPlayer
{
    public string Id { get; set; }
    public string Name { get; set; }
    public chatPlayer(string id, string name) => (Id, Name) = (id, name);
}

public class PrivateChatHub : Hub
{
    private static int count = 0;
    private static List<string> nameList = new List<string>();

    public async Task SendText(string name, string message, string sentTime)
    {
        string gameId = Context.GetHttpContext()?.Request.Query["gameId"] ?? "";

        await Clients.Group(gameId).SendAsync("ReceiveText", name, message, sentTime);
    }

    public override async Task OnConnectedAsync()
    {
        string id = Context.ConnectionId;
        string? name = Context.GetHttpContext()?.Request.Cookies["username"];
        string gameId = Context.GetHttpContext()?.Request.Query["gameId"] ?? "";
        
        var player = new chatPlayer(id, name);
        await Groups.AddToGroupAsync(id, gameId);

        if (nameList.Contains(name))
        {
            await Clients.Group(gameId).SendAsync("UpdateStatus", count, "");
            await Clients.Group(gameId).SendAsync("UpdatePlayers");
        } 
        else if (name != null && !nameList.Contains(name)){
            count++;
            await Clients.Group(gameId).SendAsync("UpdateStatus", count, " joined game", player.Name);
            await Clients.Group(gameId).SendAsync("UpdatePlayers");
            nameList.Add(name);
        }
        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception) 
    {
        string id = Context.ConnectionId;
        string? name = Context.GetHttpContext()?.Request.Cookies["username"];
        string gameId = Context.GetHttpContext()?.Request.Query["gameId"] ?? "";
        
        var player = new chatPlayer(id, name);
        await Groups.AddToGroupAsync(id, gameId);

        if (name != null && nameList.Contains(name)){
            count--;
            await Clients.Group(gameId).SendAsync("UpdateStatus", count, " left game", player.Name);
            await Clients.Group(gameId).SendAsync("UpdatePlayers");
            nameList.Remove(name);
        } else {
            await Clients.Group(gameId).SendAsync("UpdateStatus", count, "");
            await Clients.Group(gameId).SendAsync("UpdatePlayers");
        }
        await base.OnDisconnectedAsync(exception);
    }

    // TODO(2C): SendImage(name, url)  --> ReceiveImage(name, url, who)
    public async Task SendImage(string name, string url, string sentTime)
    {
        string gameId = Context.GetHttpContext()?.Request.Query["gameId"] ?? "";

        await Clients.Group(gameId).SendAsync("ReceiveImage", name, url, sentTime);
    }

    // TODO(3C): SendYouTube(name, id) --> ReceiveYouTube(name, id, who)
    public async Task SendYouTube(string name, string id, string sentTime)
    {
        string gameId = Context.GetHttpContext()?.Request.Query["gameId"] ?? "";

        await Clients.Group(gameId).SendAsync("ReceiveYouTube", name, id, sentTime);
    }
}