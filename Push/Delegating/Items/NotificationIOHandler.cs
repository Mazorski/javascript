using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Mazor.Core.Communication.Signaling.Delegating
{
	public abstract class NotificationIOHandler : SignalDelegatingHandler
	{
		public sealed override void Process (NotificationState state)
		{
			if (state.Signal.IsIncoming) { ProcessInPut(state); }
			else { ProcessOutPut(state); }
		}

		public abstract void ProcessInPut (NotificationState state);
		public abstract void ProcessOutPut (NotificationState state);
	}
}
