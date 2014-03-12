using Mazor.Core.Communication.Signaling.Delegating;
using Mazor.Core.Communication.Signaling.Hubs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Mazor.Core.Communication.Signaling.Concrete;
using System.Security.Principal;
using System.Web;
using Mazor.Core.Communication.Signaling.Messaging;
using Mazor.Core.Communication.Signaling.RealTime;

namespace Mazor.Core.Communication.Signaling.Hubs
{
	public class Hub
	{
		private IConnectionStateManager _stateManager;

		public IConnectionStateManager StateManager { get { return _stateManager; } }

		public Hub (IConnectionStateManager stateManager)
		{
			if (stateManager == null) { throw new ArgumentNullException("stateManager"); }

			_stateManager = stateManager;
		}

		public Connection[] GetUserActiveConnections (IPrincipal user)
		{
			return StateManager.Entries.Where(e => e.CurrentState == ConnectionState.Connected && e.Connection.User == user).Select(e => e.Connection).ToArray();
		}

		public Connection GetActiveConnection (string connectionId)
		{
			var entry = StateManager.Get(connectionId);

			return entry != null && entry.CurrentState == ConnectionState.Connected ? entry.Connection : null;
		}
	}
}
