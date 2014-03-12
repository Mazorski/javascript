using Mazor.Core.Communication.Signaling.Enviorment;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;

namespace Mazor.Core.Communication.Signaling.Delegating
{
	public sealed class PipelineStep
	{
		#region Fields
		private Type _delegateType;

		private PipelineStep _next;

		private string _name;
		#endregion

		#region Properties
		public Type EventHandlerType { get { return _delegateType; } }
		public PipelineStep Next { get { return _next; } }
		public string Name { get { return _name; } }
		#endregion

		#region Constructors
		private PipelineStep (Type delegateType, PipelineStep next)
		{
			_delegateType = delegateType;
			_next = next;
			_name = delegateType.Name;
		}

		private PipelineStep (string name, PipelineStep next)
		{
			_name = name;
			_next = next;
		}

		static PipelineStep ()
		{
			Started = new PipelineStep("Started",
				StartOfSignal = new PipelineStep(typeof(StartOfSignalEvent),
					ConcludingOrigin = new PipelineStep(typeof(ConcludingSignalOriginEvent),
						SignalAuthentication = new PipelineStep(typeof(SignalAuthenticationEvent),
							InferringSyncRoot = new PipelineStep(typeof(InferringSyncRootEvent),
								OriginRootSync = new PipelineStep(typeof(RootSynchronizationEvent),
									SignalAuthorization = new PipelineStep(typeof(SignalAuthorizationEvent),
										OriginConcluded = new PipelineStep(typeof(SignalOriginConcludedEvent),
											PreSignalDelegating = new PipelineStep(typeof(PreSignalDelegatingEvent),
												SignalDelegating = new PipelineStep(typeof(SignalDelegatingEvent),
													PostSignalDelegating = new PipelineStep(typeof(PostSignalDelegatingEvent),
														Sync = new PipelineStep(typeof(RootSynchronizationEvent),
															EndOfSignal = new PipelineStep(typeof(EndOfSignalEvent),
																Completed = new PipelineStep("Completed", null))))))))))))));
		}

		#endregion

		#region Steps
		public static PipelineStep Started { get; private set; }
		public static PipelineStep StartOfSignal { get; private set; }
		public static PipelineStep ConcludingOrigin { get; private set; }
		public static PipelineStep SignalAuthentication { get; private set; }
		public static PipelineStep InferringSyncRoot { get; private set; }
		public static PipelineStep OriginRootSync { get; private set; }
		public static PipelineStep SignalAuthorization { get; private set; }
		public static PipelineStep OriginConcluded { get; private set; }
		public static PipelineStep PreSignalDelegating { get; private set; }
		public static PipelineStep SignalDelegating { get; private set; }
		public static PipelineStep PostSignalDelegating { get; private set; }
		public static PipelineStep Sync { get; private set; }
		public static PipelineStep EndOfSignal { get; private set; }
		public static PipelineStep Completed { get; private set; }
		#endregion
	}
}