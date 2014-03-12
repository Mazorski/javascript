using Mazor.Core.Communication.Signaling.Messaging;
using Mazor.Core.Communication.Signaling.Delegating;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Web;

namespace Mazor.Core.Communication.Signaling.Enviorment
{
	public abstract class RawSignalSource
	{
		private readonly bool _incoming;

		public string ConnectionId { get; private set; }
		public NotificationMessage Message { get; private set; }
		public AsyncCallback Callback { get; private set; }
		public IDictionary<object, object> Items { get; private set; }
		public bool IsIncoming { get { return _incoming; } }
		public HttpContextBase Http { get; set; }

		protected RawSignalSource (string connectionId, NotificationMessage msg, AsyncCallback callback, bool isIncoming)
		{
			if (string.IsNullOrEmpty(connectionId)) { throw new ArgumentNullException("connectionId"); }
			if (msg == null) { throw new ArgumentNullException("msg"); }

			ConnectionId = connectionId;
			Message = msg;
			Callback = callback;
			Items = new Dictionary<object, object>();
			_incoming = isIncoming;
		}
	}
}
