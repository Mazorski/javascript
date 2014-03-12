using Mazor.Core.Communication.Signaling.Hubs;
using Mazor.Core.Communication.Signaling.Delegating;
using Mazor.Core.Communication.Signaling.Messaging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Mazor.Core.Communication.Signaling.Enviorment;

namespace Mazor.Core.Communication.Signaling.Delegating
{
	public abstract class SignalDelegatingHandler
	{
		public SignalDelegatingHandler InnerHandler { get; protected set; }

		protected SignalDelegatingHandler () { }
		protected SignalDelegatingHandler (SignalDelegatingHandler innerHandler)
		{
			InnerHandler = innerHandler;
		}

		public abstract void Process (NotificationState state);
	}

	public static class PushDelegatingHandlerMethods
	{
		public static SignalDelegatingHandler[] GetSequence (this SignalDelegatingHandler handler)
		{
			if (handler == null) { throw new ArgumentNullException("handler"); }

			var sequence = new List<SignalDelegatingHandler>();

			do { sequence.Insert(0, handler); } while ((handler = handler.InnerHandler) != null);

			return sequence.ToArray();
		}
	}
}
