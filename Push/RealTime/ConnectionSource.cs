using Mazor.Core.Communication.Signaling.Delegating;
using Mazor.Core.Communication.Signaling.Hubs;
using Mazor.Core.Communication.Signaling.Messaging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Principal;
using System.Text;
using System.Threading.Tasks;
using System.Web;

namespace Mazor.Core.Communication.Signaling.RealTime
{
	public class ConnectionSource : IConnectionEntry
	{
		private Receiver _receiver;
		private Transmitter _transmitter;

		public Connection Connection { get; private set; }
		public ConnectionState CurrentState { get; set; }

		protected ConnectionSource (Connection connection, Receiver receiver)
		{
			if (connection == null) { throw new ArgumentNullException("connection"); }
			if (receiver == null) { throw new ArgumentNullException("receiver"); }

			Connection = connection;
			_receiver = receiver;
		}

		public ConnectionSource (string connectionId, IPrincipal user, Receiver receiver, Transmitter transmitter)
		{
			if (string.IsNullOrEmpty(connectionId)) { throw new ArgumentNullException("connectionId"); }
			if (user == null) { throw new ArgumentNullException("user"); }
			if (receiver == null) { throw new ArgumentNullException("receiver"); }
			if (transmitter == null) { throw new ArgumentNullException("transmitter"); }

			_receiver = (m, http) =>
			{
				if (CurrentState != ConnectionState.Connected) { return null; }

				return receiver(m, http);
			};

			_transmitter = (m, cb) =>
			{
				if (CurrentState != ConnectionState.Connected) { return null; }

				return transmitter(m, cb);
			};

			Connection = new Connection(user, new ConnectionSocket(connectionId, _transmitter));
		}

		public IAsyncResult Receive (NotificationMessage msg, HttpContextBase http)
		{
			return _receiver(msg, http);
		}
	}
}
