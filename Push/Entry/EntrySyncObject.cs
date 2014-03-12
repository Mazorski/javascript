using Mazor.Core.Communication.Signaling.Delegating;
using Mazor.Core.Communication.Signaling.Messaging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Timers;
using Mazor.Core.Communication.Signaling.Enviorment;

namespace Mazor.Core.Communication.Signaling.Entry
{
	public class EntrySyncObject : IDisposable
	{
		private Action _disposing;

		public EntrySyncRoot Root { get; private set; }
		public AsyncCallback Callback { get; private set; }
		public Type SignalType { get; private set; }

		public EntrySyncObject (RawSignalSource source, ref string targetCId, EntrySyncObject sync = null)
		{
			if (source == null) { throw new ArgumentNullException("source"); }
			if (sync == null) { sync = this; }

			Root = new EntrySyncRoot(new ConnectionStrings(source.ConnectionId, ref targetCId), source.Message.Subject, sync, source.IsIncoming, out _disposing);
			Callback = source.Callback;
			SignalType = source.GetType();
		}

		public void Dispose ()
		{
			_disposing();
			_disposing = null;

			if (Root.IsReEntry) { Root.Entry.Dispose(); }

			Root = null;
			Callback = null;
			SignalType = null;
		}
	}
}
