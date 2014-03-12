using Mazor.Core.Communication.Signaling.Hubs;
using Mazor.Core.Communication.Signaling.Messaging;
using Mazor.Core.Communication.Signaling.Delegating;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Web;
using Mazor.Core.Communication.Signaling.Enviorment;
using Mazor.Core.Communication.Signaling.RealTime;

namespace Mazor.Core.Communication.Signaling.Enviorment
{
	public sealed class SignalSocketDispatcher : SignalSocketBase
	{
		private readonly Func<string, NotificationMessage, Task> _transmit;
		private readonly Func<string[], NotificationMessage, Task> _transmitMany;

		public SignalSocketDispatcher (SignalSocketBase socket) : base(socket) 
		{
			_transmit = socket.Transmit;
			_transmitMany = socket.Transmit;
		}

		public SignalSocketDispatcher (Func<string, NotificationMessage, Task> transmit) : this(transmit, null) { }

		public SignalSocketDispatcher (Func<string, NotificationMessage, Task> transmit, Func<string[], NotificationMessage, Task> transmitMany)
		{
			if (transmit == null) { throw new ArgumentNullException("socket"); }
			if (transmitMany == null) { transmitMany = base.Transmit; }
			
			_transmit = transmit;
			_transmitMany = transmitMany;
		}

		public void DispatchConnectionStateChanged (string connectionId, HttpContextBase origin, ConnectionState newState)
		{
			base.OnConnectionStateChanged(connectionId, origin, newState);
		}

		public void DispatchNotificationReceived (string connectionId, HttpContextBase origin, NotificationMessage msg)
		{
			base.OnNotificationReceived(connectionId, origin, msg);
		}

		public override Task Transmit (string connectionId, NotificationMessage msg)
		{
			return _transmit(connectionId, msg);
		}

		public override Task Transmit (string[] connectionIds, NotificationMessage msg)
		{
			return _transmitMany(connectionIds, msg);
		}
	}
}
