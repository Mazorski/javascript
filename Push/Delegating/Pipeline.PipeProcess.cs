using Mazor.Core.Communication.Signaling.Hubs;
using Mazor.Core.Communication.Signaling.Delegating;
using Mazor.Core.Communication.Signaling.Messaging;
using System;
using System.Collections.Generic;
using System.Collections.Specialized;
using System.IO;
using System.Linq;
using System.Runtime.Remoting.Messaging;
using System.Text;
using System.Threading.Tasks;
using System.Web;
using Mazor.Core.Communication.Signaling.Entry;
using Mazor.Core.Communication.Signaling.Enviorment;
using System.Reflection;
using System.Threading;
using System.Linq.Expressions;
using Mazor.Core.Communication.Signaling.Concrete;

namespace Mazor.Core.Communication.Signaling.Delegating
{
	public partial class Pipeline : SignalDelegatingHandler
	{
		public sealed class PipeProcess : IDisposable
		{
			private static readonly Action<Signal> SetCurrentSignal = signal => CallContext.LogicalSetData("Signal", signal);

			#region Fields
			private SignalWorkerRequest _wr;
			private Pipeline _pipeline;
			private CancellationTokenSource _tokenSource;
			private ManualResetEvent _pipeEndEvent;
			private PipelineStateInfo _state;
			#endregion

			#region Properties
			public NotificationState State { get; private set; }
			#endregion

			#region Construcotrs
			public static NotificationState StartPipeline (SignalWorkerRequest wr) { return new PipeProcess(wr).State; }

			private PipeProcess (SignalWorkerRequest wr)
			{
				_wr = wr;
				_pipeline = wr.Site.Bindings.GetDelegatingPipeline();

				_Init();
			}
			#endregion

			#region NonPublic members
			private void _Init ()
			{
				_wr.EndOfWork += _EndSignal;

				_pipeline.Pipeline_Start();

				_pipeline.InnerHandler = new PipeFlow();
				_pipeline.StartOfSignal = pipeline_StartOfSignal;
				_pipeline.ConcludingOrigin = pipeline_ConcludingOrigin;
				_pipeline.SignalAuthentication = pipeline_SignalAuthentication;
				_pipeline.SignalAuthorization = pipeline_SignalAuthorization;
				_pipeline.InferringSyncRoot = pipeline_InferringSyncRoot;
				_pipeline.OriginRootSync = pipeline_OriginEntrySync;
				_pipeline.OriginConcluded = pipeline_OriginConcluded;
				_pipeline.PreSignalDelegating = pipeline_PreSignalDelegating;
				_pipeline.SignalDelegating = pipeline_SignalDelegating;
				_pipeline.PostSignalDelegating = pipeline_PostSignalDelegating;
				_pipeline.Sync = pipeline_Sync;
				_pipeline.EndOfSignal = pipeline_EndOfSignal;

				_state = new PipelineStateInfo(_pipeline, _pipeEndEvent = new ManualResetEvent(false), (_tokenSource = new CancellationTokenSource()).Token)
				{
					Step = PipelineStep.Started,
					Handler = new ActionDelegatingHandler(_RunEnviorment)
				};

				State = new NotificationState(new Signal(_wr), _state);
			}

			private void _RunEnviorment (ActionDelegatingHandler action, NotificationState state)
			{
				Task.Factory.StartNew(() =>
				{
					_tokenSource.Token.Register(() => _pipeline.EndOfSignal(this, State));

					try
					{
						foreach (var h in _pipeline.GetSequence())
						{
							if (_tokenSource.IsCancellationRequested) { break; }

							_state.Handler = h;
							h.Process(state);
						}
					}
					catch (Exception error)
					{
						_pipeline.UnhandledException(this, State, error);
						_pipeline.EndOfSignal(this, State);
					}

					_FlushWorkerOutPut();
					Dispose();
				}, _tokenSource.Token);
			}

			private void _EndSignal (object caller)
			{
				if (State.CurrentStep == PipelineStep.Completed) { throw new InvalidOperationException("already terminated"); }
				if (State.CurrentStep == PipelineStep.Started) { Dispose(); return; }

				_pipeline.StartOfSignal = (s, p) => { };
				_pipeline.ConcludingOrigin = (s, p, x) => { };
				_pipeline.SignalAuthentication = (s, p) => { };
				_pipeline.SignalAuthorization = (s, p) => { };
				_pipeline.InferringSyncRoot = (s, p, y) => { };
				_pipeline.OriginRootSync = (s, p, x, y) => { };
				_pipeline.OriginConcluded = (s, p, x) => { };
				_pipeline.PreSignalDelegating = (s, p, x) => { };
				_pipeline.SignalDelegating = (s, p, x) => { };
				_pipeline.PostSignalDelegating = (s, p, x) => { };
				_pipeline.Sync = (s, p, x) => { };

				_state.Step = PipelineStep.EndOfSignal;
				_state.Handler = null;

				_tokenSource.Cancel();
			}

			private void _FlushWorkerOutPut ()
			{
				var errors = _wr.SpecifyOutPutSignalState() ? _wr.OutPutSignalState.ToArray() : new Exception[] { };
				NotificationMessage flush = null;

				if (_wr.SendOutPutSignal())
				{
					var sbj = new NotificationSubject(_wr.SubjectId, _wr.OutPutSignalAction(), _wr.ExpectInputSignal());
					flush = new NotificationMessage(sbj, _wr.OutPutSignalBodySb.ToString(), errors);

					_wr.Site.Bindings.Socket.Transmit(_wr.SourceCId, flush);
				}

				_state.OutPut = flush;
				_pipeEndEvent.Set();
			}

			#endregion

			#region Members
			public void Dispose ()
			{
				// clear CallSite
				SetCurrentSignal(null);

				// detach async
				_state.Step = PipelineStep.Completed;
				_state.Handler = null;

				// destroy state
				_pipeEndEvent.Dispose();
				_tokenSource.Dispose();
				_pipeEndEvent = null;
				_tokenSource = null;
				_state = null;
				State = null;

				// dispose worker
				_wr.Dispose();
				_wr = null;

				// destroy pipeline
				_pipeline.StartOfSignal = null;
				_pipeline.ConcludingOrigin = null;
				_pipeline.SignalAuthentication = null;
				_pipeline.SignalAuthorization = null;
				_pipeline.InferringSyncRoot = null;
				_pipeline.OriginRootSync = null;
				_pipeline.OriginConcluded = null;
				_pipeline.PreSignalDelegating = null;
				_pipeline.SignalDelegating = null;
				_pipeline.PostSignalDelegating = null;
				_pipeline.Sync = null;
				_pipeline.EndOfSignal = null;
				_pipeline.InnerHandler = null;
				_pipeline = null;
			}
			#endregion

			#region Flow Control
			void pipeline_StartOfSignal (object sender, NotificationState state)
			{
				_state.Step = PipelineStep.StartOfSignal;
				SetCurrentSignal(State.Signal);
			}

			void pipeline_ConcludingOrigin (object sender, NotificationState state, PushSignalOrigin origin)
			{
				_state.Step = PipelineStep.ConcludingOrigin;
			}

			void pipeline_SignalAuthentication (object sender, NotificationState state)
			{
				_state.Step = PipelineStep.SignalAuthentication;

				var authenticated = false;
				_pipeline.Authenticate(state, out authenticated);
				_state.SignalAuthenticated = authenticated;
			}

			void pipeline_SignalAuthorization (object sender, NotificationState state)
			{
				_state.Step = PipelineStep.SignalAuthorization;

				var authorized = false;
				_pipeline.Authorize(state, out authorized);
				_state.SignalAuthorized = authorized;
			}

			void pipeline_InferringSyncRoot (object sender, NotificationState state, Guid sId)
			{
				_state.Step = PipelineStep.InferringSyncRoot;

				_state.SyncRoot = _wr.Site.Synchronizer.GetSyncRoot(sId);
			}

			void pipeline_OriginEntrySync (object sender, NotificationState state, PushSignalOrigin origin, EntrySyncRoot root)
			{
				_state.Step = PipelineStep.OriginRootSync;

				EntrySyncObject sync = null;

				if (_state.SyncRoot != null)
				{
					sync = _wr.Site.Synchronizer.GetSyncObj(_state.SyncRoot);
				}

				_wr.Sync(sync);
			}

			void pipeline_OriginConcluded (object sender, NotificationState state, PushSignalOrigin origin)
			{
				_state.Step = PipelineStep.OriginConcluded;
			}

			void pipeline_PreSignalDelegating (object sender, NotificationState state, SignalDelegatingHandler handler)
			{
				_state.Step = PipelineStep.PreSignalDelegating;
				_state.Handler = handler;
			}

			void pipeline_SignalDelegating (object sender, NotificationState state, SignalDelegatingHandler handler)
			{
				_state.Step = PipelineStep.SignalDelegating;
				if (handler != null) { handler.Process(state); }
			}

			void pipeline_PostSignalDelegating (object sender, NotificationState state, SignalDelegatingHandler handler)
			{
				_state.Step = PipelineStep.PostSignalDelegating;
			}

			void pipeline_Sync (object sender, NotificationState state, PushSignalOrigin origin)
			{
				_state.Step = PipelineStep.Sync;

				_wr.Site.Synchronizer.Sync(state.Signal);
			}

			void pipeline_EndOfSignal (object sender, NotificationState state)
			{
				_state.Step = PipelineStep.EndOfSignal;
			}
			#endregion
		}
	}
}
