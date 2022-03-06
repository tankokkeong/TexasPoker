var builder = WebApplication.CreateBuilder(args);

builder.Services.AddSignalR();

var app = builder.Build();

app.UseFileServer();
app.MapHub<GameHub>("/hub");
app.MapHub<ChatHub>("/gChat");
app.MapHub<PrivateChatHub>("/pcChat");
app.MapHub<MiniRoomHub>("/minigameHub");
app.Run();