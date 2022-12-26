using Microsoft.AspNetCore.SignalR;
using System.Xml.Linq;

namespace Chat.Hubs
{
    public class ChatHub : Hub
    {
        private static List<string> RoomsList = new List<string>();

        public List<string> GetRooms()
        {
            return RoomsList;
        }

        public Task AddRoom(string name)
        {
            RoomsList.Add(name);
            return Clients.All.SendAsync("RoomAdded", name);
        }

        public Task Join(string chanName)
        {
            foreach (var item in RoomsList)
            {
                Groups.RemoveFromGroupAsync(Context.ConnectionId, item);
            }
            return Groups.AddToGroupAsync(Context.ConnectionId, chanName);
        }

        public Task Disconnect(string chanName)
        {
            return Groups.RemoveFromGroupAsync(Context.ConnectionId, chanName);
        }

        public Task SendMessage(string user, string message, string room)
        {
            return Clients.Groups(room).SendAsync("ReceiveMessage", user, message, DateTime.UtcNow.ToString());
        }
    }
}