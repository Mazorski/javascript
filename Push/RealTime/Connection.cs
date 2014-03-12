using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web;
using Mazor.Core.Model;
using Mazor.Core.Communication.Signaling.Delegating;
using System.Linq.Expressions;
using System.Reflection;
using System.IO;
using Mazor.Core.Communication.Signaling.Hubs;
using System.Security.Principal;
using Mazor.Core.Communication.Signaling.Messaging;

namespace Mazor.Core.Communication.Signaling.RealTime
{
    public enum ConnectionState { Pending, Connected, Disconnected }

    public class Connection
    {
		public readonly IPrincipal User;
		public readonly ConnectionSocket Socket;

		public string Id { get { return Socket.ConnectionId; } }

		public Connection (IPrincipal user, ConnectionSocket socket)
		{
			if (user == null) { throw new ArgumentNullException("user"); }
			if (socket == null) { throw new ArgumentNullException("socket"); }

			User = user;
			Socket = socket;
		}

		public virtual IAsyncResult Send (NotificationMessage msg, AsyncCallback cb)
		{
			return Socket.Transmit(msg, cb);
		}
    }
}