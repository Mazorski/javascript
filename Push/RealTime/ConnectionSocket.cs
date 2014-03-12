using Mazor.Core.Communication.Signaling.Hubs;
using Mazor.Core.Communication.Signaling.Messaging;
using Mazor.Core.Communication.Signaling.Delegating;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Mazor.Core.Communication.Signaling.Enviorment;

namespace Mazor.Core.Communication.Signaling.RealTime
{
	public class ConnectionSocket
	{
		public readonly string ConnectionId;
		private readonly Transmitter _transmitter; 

		public ConnectionSocket (string connectionId, Transmitter transmitter)
		{
			if (string.IsNullOrEmpty(connectionId)) { throw new ArgumentNullException("connectionId"); }
			if (transmitter == null) { throw new ArgumentNullException("transmitter"); }

			ConnectionId = connectionId;
			_transmitter = transmitter;
		}

		public IAsyncResult Transmit (NotificationMessage msg, AsyncCallback cb)
		{
			return _transmitter(msg, cb);
		}
	}
}
