using Mazor.Core.Communication.Signaling.Hubs;
using Mazor.Core.Communication.Signaling.RealTime;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Principal;
using System.Text;
using System.Threading.Tasks;

namespace Mazor.Core.Communication.Signaling.Hubs
{
	public delegate void ConnectionEntryStateChangedEvent (IConnectionEntry entry, ConnectionState oldState);

	public interface IConnectionStateManager
	{
		event ConnectionEntryStateChangedEvent EntryStateChanged;

		IEnumerable<IConnectionEntry> Entries { get; }

		IConnectionEntry Get (string cId);
		void ChangeState (string cId, ConnectionState newState);
	}

	
}
