using Mazor.Core.Communication.Signaling.Hubs;
using Mazor.Core.Communication.Signaling.RealTime;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Remoting.Messaging;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace Mazor.Core.Communication.Signaling.Entry
{
	public class NotificationAsyncResult : IAsyncResult
	{
		private object _state;
		private AsyncResult _call;
		private bool _disposed;

		public Hub Hub { get; private set; }
		public Connection Connection { get { return Hub.GetActiveConnection(SyncObj.Root.SourceConnectionId); } }
		public EntrySyncObject SyncObj { get; private set; }
		public UseWaitEvent UseWaitEvent { get; private set; }
		public object State { get { return _state; } }
		public bool EndInvokeCalled { get { return _call.EndInvokeCalled; } }
		public bool IsOpEnded { get { return _disposed || _call.IsCompleted; } }

		object IAsyncResult.AsyncState { get { return State; } }
		WaitHandle IAsyncResult.AsyncWaitHandle { get { return UseWaitEvent; } }
		bool IAsyncResult.CompletedSynchronously { get { return _call.CompletedSynchronously; } }
		bool IAsyncResult.IsCompleted { get { return IsOpEnded; } }

		public NotificationAsyncResult (Hub hub, EntrySyncObject syncObj)
		{
			if (hub == null) { throw new ArgumentNullException("hub"); }
			if (syncObj == null) { throw new ArgumentNullException("syncObj"); }

			Hub = hub;
			SyncObj = syncObj;
			UseWaitEvent = new UseWaitEvent(syncObj.Root.IsIncoming ? false : !syncObj.Root.Subject.CallBack);

			UseWaitEvent.SetCallUse(o => _state = o);

			SyncObj.Root.Disposing += () =>
			{
				_disposed = true;
				UseWaitEvent.Dispose();
				_state = null;
			};
		}

		public void Begin (AsyncCallback cb, object obj)
		{
			if (_call != null) { throw new InvalidOperationException("BeginAlreadyCalled"); }

			_call = (AsyncResult)SyncObj.Callback.BeginInvoke(this, cb, obj);
		}

		public void End ()
		{
			if (_call == null) { throw new InvalidOperationException("BeginNotCalled"); }
			
			SyncObj.Callback.EndInvoke(_call);
		}
	}
}
