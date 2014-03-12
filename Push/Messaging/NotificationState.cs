using Mazor.Core.Communication.Signaling.Entry;
using Mazor.Core.Communication.Signaling.Enviorment;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace Mazor.Core.Communication.Signaling.Delegating
{
	public sealed class NotificationState
	{
		private Signal _signal;
		private PipelineStateInfo _pipeState;
		private EntrySyncStateInfo _syncState;
		private Async _async;

		public Pipeline Pipeline { get { return _pipeState.Pipeline; } }
		public Signal Signal { get { return _signal; } }
		public PipelineStep CurrentStep { get { return _pipeState.Step; } }
		public SignalDelegatingHandler CurrentHandler { get { return _pipeState.Handler; } }
		public Action<NotificationState> CurrentAction { get { return CurrentHandler.Process; } }
		public EntrySyncRoot SyncRoot { get { return _syncState.Root; } }
		public bool SignalAuthenticated { get { return _pipeState.SignalAuthenticated; } }
		public bool SignalAuthorized { get { return _pipeState.SignalAuthorized; } }
		public bool IsCancellationRequested { get { return _pipeState.CancellationToken.IsCancellationRequested; } }

		public IAsyncResult Async { get { return _async; } }

		public NotificationState (Signal signal, PipelineStateInfo pipe, EntrySyncStateInfo sync)
		{
			if (signal == null) { throw new ArgumentNullException("signal"); }
			if (pipe == null) { throw new ArgumentNullException("pipe"); }
			if (sync == null) { throw new ArgumentNullException("sync"); }

			_signal = signal;
			_pipeState = pipe;
			_syncState = sync;

			signal.State = this;
		}

		public class Async : IAsyncResult
		{
			private NotificationState _notification;

			public bool IsPipeProcessCompleted { get { return _notification._pipeState.IsProcessCompleted; } }
			public bool IsPipeTerminated { get { return _notification._pipeState.IsProcessTerminated; } }

			public bool IsCallbackCompleted { get; set; }

			object IAsyncResult.AsyncState { get { throw new NotSupportedException("Cast to NotificationState.Async")  ; } }
			WaitHandle IAsyncResult.AsyncWaitHandle { get { throw new NotSupportedException("Cast to NotificationState.Async"); } }
			bool IAsyncResult.CompletedSynchronously { get { throw new NotSupportedException("Cast to NotificationState.Async"); } }
			bool IAsyncResult.IsCompleted { get { throw new NotSupportedException("Cast to NotificationState.Async"); } }

			public Async (NotificationState notification)
			{
				if (notification == null) { throw new ArgumentNullException("notification"); }

				_notification = notification;
			}

			public bool Flush ()
			{
				return _notification._pipeState.PipeEndEvent.WaitOne();
			}

			public bool Sync ()
			{
				return _notification._syncState.UseWaitEvent.WaitOne();
			}

			public static explicit operator Async (NotificationState state)
			{
				return new Async(state);
			}
		}
	}
}
