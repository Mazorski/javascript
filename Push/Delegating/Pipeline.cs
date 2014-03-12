using Mazor.Core.Communication.Signaling.Hubs;
using Mazor.Core.Communication.Signaling.Delegating;
using Mazor.Core.Communication.Signaling.Messaging;
using System;
using System.Collections.Generic;
using System.Collections.Specialized;
using System.IO;
using System.Linq;
using System.Runtime.Remoting.Messaging;
using System.Security.Principal;
using System.Text;
using System.Threading.Tasks;
using System.Web;
using Mazor.Core.Communication.Signaling.Entry;
using Mazor.Core.Communication.Signaling.Enviorment;
using Mazor.Core.Communication.Signaling.RealTime;

namespace Mazor.Core.Communication.Signaling.Delegating
{
	#region Pipeline flow
	public delegate void StartOfSignalEvent (object sender, NotificationState state);
	
	public delegate void ConcludingSignalOriginEvent (object sender, NotificationState state, PushSignalOrigin origin);
	public delegate void SignalAuthenticationEvent (object sender, NotificationState state);
	public delegate void InferringSyncRootEvent (object sender, NotificationState state, Guid sId);
	public delegate void OriginSynchronizationEvent (object sender, NotificationState state, PushSignalOrigin origin, EntrySyncRoot syncedRoot);
	public delegate void SignalAuthorizationEvent (object sender, NotificationState state);
	public delegate void SignalOriginConcludedEvent (object sender, NotificationState state, PushSignalOrigin origin);
	
	public delegate void PreSignalDelegatingEvent (object sender, NotificationState state, SignalDelegatingHandler handler);
	public delegate void SignalDelegatingEvent (object sender, NotificationState state, SignalDelegatingHandler handler);
	public delegate void PostSignalDelegatingEvent (object sender, NotificationState state, SignalDelegatingHandler handler);
	
	public delegate void RootSynchronizationEvent (object sender, NotificationState state, PushSignalOrigin origin);
	
	public delegate void EndOfSignalEvent (object sender, NotificationState state);
	#endregion

	#region Communication delegates (APM)
	public delegate IAsyncResult Transmitter (NotificationMessage msg, AsyncCallback callback);
	public delegate IAsyncResult Receiver (NotificationMessage msg, HttpContextBase http);
	#endregion

	#region Error handling
	public delegate void UnhandledExceptionError (object sender, NotificationState state, Exception error);
	public delegate void DeviceDisconnectedError (object sender, NotificationState state, Connection device);
	#endregion

	public partial class Pipeline : SignalDelegatingHandler
	{
		#region Events
		public event StartOfSignalEvent StartOfSignal;
		public event ConcludingSignalOriginEvent ConcludingOrigin;
		public event SignalAuthenticationEvent SignalAuthentication;
		public event InferringSyncRootEvent InferringSyncRoot;
		public event OriginSynchronizationEvent OriginRootSync;
		public event SignalAuthorizationEvent SignalAuthorization;
		public event SignalOriginConcludedEvent OriginConcluded;
		public event PreSignalDelegatingEvent PreSignalDelegating;
		public event SignalDelegatingEvent SignalDelegating;
		public event PostSignalDelegatingEvent PostSignalDelegating;
		public event RootSynchronizationEvent Sync;
		public event EndOfSignalEvent EndOfSignal;
		#endregion

		#region Errors
		public event UnhandledExceptionError UnhandledException;
		public event DeviceDisconnectedError DeviceDisconnected;
		#endregion

		#region Constructors
		public Pipeline () { }
		#endregion

		#region NonPublic members
		protected virtual void Pipeline_Start () { }

		protected virtual void Authenticate (NotificationState state, out bool isAuthenticated)
		{
			var connection = state.Signal.Origin.Source;

			if (connection != null && connection.User.Identity.IsAuthenticated) { isAuthenticated = true; }
			else { isAuthenticated = false; }
		}

		protected virtual void Authorize (NotificationState push, out bool isAuthorized)
		{
			isAuthorized = true;
		}
		#endregion

		#region DelegatingHandler members
		public sealed override void Process (NotificationState state) { }
		#endregion

		#region Members
		//public void AddOnStartOfPushAsync (StartOfSignalEvent start, StartOfSignalEvent end)
		//{
			
		//}


		//public void RemoveOnStartOfPushAsync (StartOfSignalEvent start, StartOfSignalEvent end)
		//{

		//}

		//public void AddOnGatheringContextAsync (GatheringSignalOriginEvent start, StartOfSignalEvent end)
		//{
		//}

		//public void RemoveOnGatheringContextAsync (GatheringSignalOriginEvent start, StartOfSignalEvent end)
		//{
		//}

		//public void AddOnPushAuthenticationAsync (SignalAuthenticationEvent start, SignalAuthenticationEvent end)
		//{
		//}

		//public void RemoveOnPushAuthenticationAsync (SignalAuthenticationEvent start, SignalAuthenticationEvent end)
		//{
		//}

		//public void AddOnPushAuthorizationAsync (SignalAuthorizationEvent start, SignalAuthorizationEvent end)
		//{
		//}
		//public void RemoveOnPushAuthorizationAsync (SignalAuthorizationEvent start, SignalAuthorizationEvent end)
		//{
		//}

		//public void AddOnEntryAcquiringAsync (SignalEntryAcquiringEvent start, SignalEntryAcquiringEvent end)
		//{
		//}

		//public void RemoveOnEntryAcquiringAsync (SignalEntryAcquiringEvent start, SignalEntryAcquiringEvent end)
		//{
		//}

		//public void AddOnComparingPredictionAsync (ComparingSignalEntryPredictionEvent start, ComparingSignalEntryPredictionEvent end)
		//{
		//}

		//public void RemoveOnComparingPredictionAsync (ComparingSignalEntryPredictionEvent start, ComparingSignalEntryPredictionEvent end)
		//{
		//}

		//public void AddOnContextConcludedAsync (SignalOriginConcludedEvent start, SignalOriginConcludedEvent end)
		//{
		//}

		//public void RemoveOnContextConcludedAsync (SignalOriginConcludedEvent start, SignalOriginConcludedEvent end)
		//{
		//}

		//public void AddOnPrePushDelegatingAsync (PreSignalDelegatingEvent start, PreSignalDelegatingEvent end)
		//{
		//}

		//public void RemoveOnPrePushDelegatingAsync (PreSignalDelegatingEvent start, PreSignalDelegatingEvent end)
		//{
		//}

		//public void AddOnPushDelegatingAsync (SignalDelegatingEvent start, SignalDelegatingEvent end)
		//{
		//}

		//public void RemoveOnPushDelegatingAsync (SignalDelegatingEvent start, SignalDelegatingEvent end)
		//{
		//}

		//public void AddOnPostPushDelegatingAsync (PostSignalDelegatingEvent start, PostSignalDelegatingEvent end)
		//{
		//}

		//public void RemoveOnPostPushDelegatingAsync (PostSignalDelegatingEvent start, PostSignalDelegatingEvent end)
		//{
		//}

		//public void AddOnPredictingResolvingEntryAsync (ResolvingEntrySyncEvent start, ResolvingEntrySyncEvent end)
		//{
		//}

		//public void RemoveOnPredictingResolvingEntryAsync (ResolvingEntrySyncEvent start, ResolvingEntrySyncEvent end)
		//{
		//}

		//public void AddOnEndOfPushAsync (EndOfSignalEvent start, EndOfSignalEvent end)
		//{
		//}

		//public void RemoveOnEndOfPushAsync (EndOfSignalEvent start, EndOfSignalEvent end)
		//{
		//}
		#endregion
	}
}
