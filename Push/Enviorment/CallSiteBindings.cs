  using Mazor.Core.Communication.Signaling.Hubs;
using Mazor.Core.Communication.Signaling.Delegating;
using Mazor.Core.Communication.Signaling.Messaging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Principal;
using System.Text;
using System.Threading.Tasks;
using System.Timers;
using System.Web;
using Mazor.Core.Communication.Signaling.Entry;
using Mazor.Core.Communication.Signaling.Enviorment;
using Mazor.Core.Communication.Signaling.Concrete;
using Mazor.Core.Communication.Signaling.RealTime;

namespace Mazor.Core.Communication.Signaling.Enviorment
{
	public class CallSiteBindings
	{
		#region Assert
		private static readonly Type _PipelineType = typeof(Pipeline);
		private static readonly Type _DelegatingHandlerType = typeof(SignalDelegatingHandler);
		private static void AssertDelegatingHandler (Type delegatingHandler)
		{
			if (delegatingHandler == null || !delegatingHandler.IsSubclassOrSame(_DelegatingHandlerType))
				throw new ArgumentException(string.Format("does not extends '{0}'", _DelegatingHandlerType.Name));
		}

		private static void AssertPipeline (Type pipeline)
		{
			if (pipeline == null || !pipeline.IsSubclassOrSame(_PipelineType))
				throw new ArgumentException(string.Format("does not extends '{0}'", _PipelineType.Name));
		}
		#endregion

		#region Fields
		private readonly ConnectionSourceCollection Sources;
		public readonly Hub Hub;
		public readonly SignalSocketBase Socket;
		public readonly Type PipelineType;
		public readonly Type HandlerType;
		#endregion

		#region Constructors
		public CallSiteBindings (SignalSocketBase socket, Type delegatingHandler)
			: this(socket, delegatingHandler, null) { }

		public CallSiteBindings (SignalSocketBase socket, Type delegatingHandler, Type delegatingPipeline)
		{
			if (socket == null) { throw new ArgumentNullException("socket"); }
			if (delegatingHandler == null) { throw new ArgumentNullException("delegatingHandler"); }
			if (delegatingPipeline == null) { delegatingPipeline = _PipelineType; }

			AssertDelegatingHandler(delegatingHandler);
			AssertPipeline(delegatingPipeline);

			Socket = socket;
			PipelineType = delegatingPipeline;
			HandlerType = delegatingHandler;
			Sources = new ConnectionSourceCollection();
			Hub = new Hub(Sources.StateManager);
		}
		#endregion

		#region NonPublic members
		private object _InternalDefaultTypeCreate (Type type)
		{ 
			return Activator.CreateInstance(type, new object[] { }); 
		}

		protected virtual Connection DeclareConnection (SignalCallSite site, string connectionId, IPrincipal user, ConnectionState initialState)
		{
			Receiver receiver = site.BoundReceivingChannel(connectionId);
			Transmitter transmitter = site.BoundTransmittingChannel(connectionId);

			var source = new ConnectionSource(connectionId, user, receiver, transmitter) { CurrentState = initialState };

			Sources.Add(source);

			return source.Connection;
		}

		protected virtual Group DeclareGroup (SignalCallSite site, string name, IPrincipal admin, ConnectionState initialState)
		{
			var items = new List<Connection>();
			ConnectionEntryStateChangedEvent stateChanged = (e, state) => { };
			Transmitter transmitter = null;
			Receiver receiver = null;
			GroupSource source = null;

			transmitter = (msg, cb) =>
			{
				IAsyncResult result = null;

				result = site.BoundTransmittingChannel(name)(msg, r =>
				{
					string[] cids = null;
					NotificationMessage flush = null;

					result.AsyncWaitHandle.WaitOne();

					if ((flush = result.AsyncState as NotificationMessage) != null && (cids = items.Select(c => c.Id).ToArray()).Count() > 0)
					{
						Socket.Transmit(cids, flush);
					}
				});

				return result;
			};

			receiver = (msg, http) =>
			{
				throw new NotSupportedException("group receive is not supported");
			};

			source = new GroupSource(admin, items, new ConnectionSocket(name, transmitter), receiver, stateChanged);

			Sources.Add(source);

			return source.Group;
		}
		#endregion

		#region Members
		public virtual Pipeline GetDelegatingPipeline () 
		{ 
			return (Pipeline)_InternalDefaultTypeCreate(PipelineType); 
		}

		public virtual SignalDelegatingHandler GetDelegatingHandler () 
		{
			return (SignalDelegatingHandler)_InternalDefaultTypeCreate(HandlerType); 
		}

		public virtual void Bind (SignalCallSite site)
		{
			ConnectionStateChangedEvent stateChanged = (cId, ctx, state) =>
			{
				var entry = Hub.StateManager.Get(cId);

				if (entry != null) { Hub.StateManager.ChangeState(cId, state); }
				else { DeclareConnection(site, cId, ctx.User, state); }
			};

			SignalReceivedEvent signalReceived = (cId, http, signal) =>
			{
				ConnectionSource source = Sources.Get(cId);
				if (source == null) { throw new InvalidOperationException("Bindings were made but no connection source exist"); }
				source.Receive(signal, http);
			};

			Socket.ConnectionStateChanged += stateChanged;
			Socket.NotificationReceived += signalReceived;
		}
		#endregion
	}
}
