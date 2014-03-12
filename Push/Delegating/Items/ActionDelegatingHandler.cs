using Mazor.Core.Communication.Signaling.Delegating;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Mazor.Core.Communication.Signaling.Concrete
{
	public class ActionDelegatingHandler : SignalDelegatingHandler
	{
		protected readonly Action<ActionDelegatingHandler, NotificationState> Action;

		public ActionDelegatingHandler (Action<ActionDelegatingHandler, NotificationState> action)
			: this(null, action) { }

		public ActionDelegatingHandler (SignalDelegatingHandler innerHandler, Action<ActionDelegatingHandler, NotificationState> action)
			: base(innerHandler) { Action = action; }

		public override void Process (NotificationState state) { Action(this, state); }
	}
}
