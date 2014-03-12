using Mazor.Core.Communication.Signaling.Hubs;
using Mazor.Core.Communication.Signaling.Messaging;
using Mazor.Core.Communication.Signaling.Delegating;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Web;
using Mazor.Core.Communication.Signaling.RealTime;

namespace Mazor.Core.Communication.Signaling.Enviorment
{
	public delegate void ConnectionStateChangedEvent (string connectionId, HttpContextBase http, ConnectionState state);

	public delegate void SignalReceivedEvent (string connectionId, HttpContextBase http, NotificationMessage msg);

	public abstract class SignalSocketBase
	{
		public event ConnectionStateChangedEvent ConnectionStateChanged;
		public event SignalReceivedEvent NotificationReceived;

		protected SignalSocketBase () { }
		protected SignalSocketBase (SignalSocketBase socket)
		{
			socket.ConnectionStateChanged += ConnectionStateChanged;
			socket.NotificationReceived += NotificationReceived;
		}

		protected void OnConnectionStateChanged (string connectionId, HttpContextBase http, ConnectionState newState)
		{
			if (ConnectionStateChanged != null) { ConnectionStateChanged(connectionId, http, newState); }
		}

		protected void OnNotificationReceived (string connectionId, HttpContextBase http, NotificationMessage msg)
		{
			if (NotificationReceived != null) { NotificationReceived(connectionId, http, msg); }
		}

		public abstract Task Transmit (string connectionId, NotificationMessage msg);

		public virtual Task Transmit (string[] connectionIds, NotificationMessage msg)
		{
			IList<Task> tasks = new List<Task>();

			foreach (var cId in connectionIds) { tasks.Add(Transmit(cId, msg)); }

			return Task.Factory.StartNew(() => Task.WaitAll(tasks.ToArray()));
		}
	}
}
