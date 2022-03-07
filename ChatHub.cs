using Microsoft.AspNetCore.SignalR;

public class ChatHub : Hub
{
    private static int count = 0;
    private static List<string> nameList = new List<string>();

    public async Task SendText(string name, string message, string sentTime)
    {
        await Clients.Caller.SendAsync("ReceiveText", name, message, "caller", sentTime);
        await Clients.Others.SendAsync("ReceiveText", name, message, "others", sentTime);
    }

    public override async Task OnConnectedAsync()
    {
        string? name = Context.GetHttpContext()?.Request.Cookies["username"];
        string? userID = Context.GetHttpContext()?.Request.Cookies["userID"];

        if (nameList.Contains(name))
        {
            await Clients.All.SendAsync("UpdateStatus", count, "");
        } 
        else if (name != null && !nameList.Contains(name)){
            count++;
            await Clients.All.SendAsync("UpdateStatus", count, " joined", name, userID);
            nameList.Add(name);
        }
        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception) 
    {
        string? name = Context.GetHttpContext()?.Request.Cookies["username"];
        string? userID = Context.GetHttpContext()?.Request.Cookies["userID"];

        if (name != null && nameList.Contains(name)){
            count--;
            await Clients.All.SendAsync("UpdateStatus", count, " left", name, userID);
            nameList.Remove(name);
        } else {
            await Clients.All.SendAsync("UpdateStatus", count, "");
        }
        await base.OnDisconnectedAsync(exception);
    }

    // TODO(2C): SendImage(name, url)  --> ReceiveImage(name, url, who)
    public async Task SendImage(string name, string url, string sentTime)
    {
        await Clients.Caller.SendAsync("ReceiveImage", name, url, "caller", sentTime);
        await Clients.Others.SendAsync("ReceiveImage", name, url, "others", sentTime);
    }

    // TODO(3C): SendYouTube(name, id) --> ReceiveYouTube(name, id, who)
    public async Task SendYouTube(string name, string id, string sentTime)
    {
        await Clients.Caller.SendAsync("ReceiveYouTube", name, id, "caller", sentTime);
        await Clients.Others.SendAsync("ReceiveYouTube", name, id, "others", sentTime);
    }
}