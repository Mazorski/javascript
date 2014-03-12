using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Mazor.Core.Communication.Signaling.Delegating
{
	public partial class Pipeline : SignalDelegatingHandler
	{
		private class _StartSignal : SignalDelegatingHandler
		{
			public override void Process (NotificationState state)
			{
				state.Pipeline.StartOfSignal(this, state);
			}
		}

		private class _GatherOrigin : SignalDelegatingHandler
		{
			public _GatherOrigin () : base(new _StartSignal()) { }
			public override void Process (NotificationState state)
			{
				state.Pipeline.ConcludingOrigin(this, state, state.Signal.Origin);
			}
		}

		private class _AuthenticateSignal : SignalDelegatingHandler
		{
			public _AuthenticateSignal () : base(new _GatherOrigin()) { }
			public override void Process (NotificationState state)
			{
				state.Pipeline.SignalAuthentication(this, state);
			}
		}

		private class _ObtainSignalSyncRoot : SignalDelegatingHandler
		{
			public _ObtainSignalSyncRoot () : base(new _AuthenticateSignal()) { }
			public override void Process (NotificationState state)
			{
				state.Pipeline.InferringSyncRoot(this, state, state.Signal.ContextIdentity);
				state.Pipeline.OriginRootSync(this, state, state.Signal.Origin, state.SyncRoot);
			}
		}

		private class _AuthorizedSignal : SignalDelegatingHandler
		{
			public _AuthorizedSignal () : base(new _ObtainSignalSyncRoot()) { }
			public override void Process (NotificationState state)
			{
				state.Pipeline.SignalAuthorization(this, state);
			}
		}

		private class _ConcludeOrigin : SignalDelegatingHandler
		{
			public _ConcludeOrigin () : base(new _AuthorizedSignal()) { }

			public override void Process (NotificationState state)
			{
				state.Pipeline.OriginConcluded(this, state, state.Signal.Origin);
			}
		}

		private class _DelegateSignal : SignalDelegatingHandler
		{
			public _DelegateSignal () : base(new _ConcludeOrigin()) { }

			public override void Process (NotificationState state)
			{
				SignalDelegatingHandler[] handlers = state.Signal.DelegatingHandler.GetSequence();

				foreach (var h in handlers)
				{
					state.Pipeline.PreSignalDelegating(this, state, h);
					state.Pipeline.SignalDelegating(this, state, h);
					state.Pipeline.PostSignalDelegating(this, state, h);
				}
			}
		}

		private class _SignalRootSync : SignalDelegatingHandler
		{
			public _SignalRootSync () : base(new _DelegateSignal()) { }

			public override void Process (NotificationState state)
			{
				state.Pipeline.Sync(this, state, state.Signal.Origin);
			}
		}

		private class _EndSignal : SignalDelegatingHandler
		{
			public _EndSignal () : base(new _SignalRootSync()) { }

			public override void Process (NotificationState state)
			{
				state.Pipeline.EndOfSignal(this, state);
			}
		}

		protected class PipeFlow : SignalDelegatingHandler
		{
			public PipeFlow () : base(new _EndSignal()) { }

			public sealed override void Process (NotificationState state) { }
		}
	}
}
