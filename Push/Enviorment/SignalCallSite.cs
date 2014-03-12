using Mazor.Core.Communication.Signaling.Delegating;
using Mazor.Core.Communication.Signaling.Entry;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Remoting.Messaging;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using System.Web;

namespace Mazor.Core.Communication.Signaling.Enviorment
{
	public abstract class SignalCallSite
	{
		private readonly CallSiteBindings _bindings;
		private readonly CallSiteSynchronizer _synchronizer;

		public CallSiteBindings Bindings { get { return _bindings; } }
		public CallSiteSynchronizer Synchronizer { get { return _synchronizer; } }

		public SignalCallSite (CallSiteBindings bindings) : this(bindings, new CallSiteSynchronizer()) { }
		public SignalCallSite (CallSiteBindings bindings, CallSiteSynchronizer synchronizer)
		{
			if (bindings == null) { throw new ArgumentNullException("bindings"); }
			if (synchronizer == null) { throw new ArgumentNullException("synchronizer"); }

			_bindings = bindings;
			_synchronizer = synchronizer;
		}

		public virtual Transmitter BoundTransmittingChannel (string connectionId)
		{
			return (msg, cb) => Dispatch(new OutGoingSignal(connectionId, msg, cb)).Async;
		}

		public virtual Receiver BoundReceivingChannel (string connectionId)
		{
			return (msg, http) => Dispatch(new IncomingSignal(connectionId, msg) { Http = http }).Async;
		}

		protected abstract NotificationState Dispatch (RawSignalSource signal);
	}

}
