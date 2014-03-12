using Mazor.Core.Communication.Signaling.Hubs;
using Mazor.Core.Communication.Signaling.Delegating;
using Mazor.Core.Communication.Signaling.Messaging;
using System;
using System.Collections.Generic;
using System.Collections.Specialized;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;
using System.Web;
using Mazor.Core.Communication.Signaling.Entry;
using System.Timers;
using Mazor.Core.Communication.Signaling.Enviorment;
using System.Threading;
using Mazor.Core.Communication.Signaling.RealTime;

namespace Mazor.Core.Communication.Signaling
{
	public static class SignalRuntime
	{
		public static bool IsGroup (this Connection connection) { return connection is Group; }

		public static void Bind (this CallSiteBindings bindings)
		{
			bindings.Bind(new _RuntimeSite(bindings));
		}

		public static void BindInputPipe (this Pipeline pipeline, SignalWorkerRequest wr)
		{
			if (pipeline == null) { throw new ArgumentNullException("pipeline"); }
			if (wr == null || !wr.IsIncoming) { throw new ArgumentException("wr is not input"); }

			pipeline.OriginConcluded += (s, state, origin) =>
			{    
				var callBack = state.Signal.CallBack;

				if (!state.SignalAuthenticated) { callBack.Errors.Add(new Exception("not authenticated")); }
				if (!state.SignalAuthorized) { callBack.Errors.Add(new Exception("not authorized")); }

				if (!callBack.IsContextValid)
				{
					callBack.ExpectSignal = false;

					if (!callBack.SpecifyState) { callBack.Errors.Clear(); }

					callBack.End();
				}
			};

			pipeline.Sync += (s, state, origin) =>
			{
				if (!state.Signal.CallBack.ExpectSignal)
				{
					origin.Sync.Dispose();
				}
			};
		}

		public static void BindOutputPipe (this Pipeline pipeline, SignalWorkerRequest wr)
		{
			if (pipeline == null) { throw new ArgumentNullException("pipeline"); }
			if (wr == null || wr.IsIncoming) { throw new ArgumentException("wr is not output"); }

			pipeline.StartOfSignal += (s, state) =>
			{
				state.Signal.CallBack.SignalBack = true;
				state.Signal.CallBack.SpecifyState = true;
			};

			pipeline.Sync += (s, state, origin) =>
			{
				if (!state.Signal.CallBack.ExpectSignal)
				{
					origin.Sync.Dispose();
				}
			};
		}

		public static NotificationState Process (SignalWorkerRequest wr)
		{
			var state = Pipeline.PipeProcess.StartPipeline(wr);

			if (wr.IsIncoming) { state.Pipeline.BindInputPipe(wr); }
			else { state.Pipeline.BindOutputPipe(wr); }

			state.CurrentAction(state);

			return state;
		}


		private sealed class _RuntimeSite : SignalCallSite
		{
			public _RuntimeSite (CallSiteBindings binder) : base(binder) { }

			protected override NotificationState Dispatch (RawSignalSource signal)
			{
				if (signal == null) { throw new ArgumentNullException("push"); }

				SignalWorkerRequest wr = new SignalWorkerRequest(this, signal, Bindings.GetDelegatingHandler(), new List<Exception>());

				return SignalRuntime.Process(wr);
			}
		}

	}
}
