using Mazor.Core.Communication.Signaling.Entry;
using Mazor.Core.Communication.Signaling.Messaging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace Mazor.Core.Communication.Signaling.Delegating
{
	public class PipelineStateInfo
	{
		private Pipeline _pipeline;
		private CancellationToken _cancellationToken;
		private WaitHandle _pipeEndEvent;
		private PipelineStep _prvStep;
		private PipelineStep _step;

		public Pipeline Pipeline { get { return _pipeline; } }
		public CancellationToken CancellationToken { get { return _cancellationToken; } }
		public WaitHandle PipeEndEvent { get { return _pipeEndEvent; } }
		public PipelineStep Step { get { return _step; } set { _SetStep(value); } }
		public bool IsProcessCompleted { get { return _step == PipelineStep.Completed; } }
		public bool IsProcessTerminated { get { return _prvStep == PipelineStep.Started && IsProcessCompleted; } }
		public SignalDelegatingHandler Handler { get; set; }
		public NotificationMessage OutPut { get; set; }
		public bool SignalAuthenticated { get; set; }
		public bool SignalAuthorized { get; set; }

		public PipelineStateInfo (Pipeline pipeline, CancellationToken cancellationToken, WaitHandle pipeEndEvent)
		{
			if (pipeline == null) { throw new ArgumentNullException("pipeline"); }
			if (cancellationToken == null) { throw new ArgumentNullException("cancellationToken"); }
			if (pipeEndEvent == null) { throw new ArgumentNullException("pipeEndEvent"); }

			_pipeline = pipeline;
			_pipeEndEvent = pipeEndEvent;
			_cancellationToken = cancellationToken;
		}

		private void _SetStep (PipelineStep step)
		{
			if (step == null) { throw new ArgumentNullException("step"); }
			if (_step != null) { _prvStep = _step; }

			_step = step;
		}
	}
}
