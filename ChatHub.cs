using Microsoft.AspNetCore.SignalR;

public class ChatHub : Hub
{
    private static int count = 0;
    private static List<string> nameList = new List<string>();

    public async Task SendText(string name, string message)
    {
        await Clients.Caller.SendAsync("ReceiveText", name, message, "caller");
        await Clients.Others.SendAsync("ReceiveText", name, message, "others");
    }

    public override async Task OnConnectedAsync()
    {
        string? name = Context.GetHttpContext()?.Request.Cookies["username"];

        if (nameList.Contains(name))
        {
            await Clients.All.SendAsync("UpdateStatus", count, "");
        } 
        else if (name != null && !nameList.Contains(name)){
            count++;
            await Clients.All.SendAsync("UpdateStatus", count, $"<b>{name}</b> joined");
            nameList.Add(name);
        }
        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception) 
    {
        string? name = Context.GetHttpContext()?.Request.Cookies["username"];

        if (name != null){
            count--;
            await Clients.All.SendAsync("UpdateStatus", count, $"<b>{name}</b> left");
            nameList.Remove(name);
        }
        await base.OnDisconnectedAsync(exception);
    }

    public async Task SendImage(string name, string url)
    {
        await Clients.Caller.SendAsync("ReceiveImage", name, url, "caller");
        await Clients.Others.SendAsync("ReceiveImage", name, url, "others");
    }
}