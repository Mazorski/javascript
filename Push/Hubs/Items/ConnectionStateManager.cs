using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Collections.Specialized;
using System.Linq;
using System.Web;
using Mazor.Core.Model;
using System.Timers;
using System.Security.Principal;
using Mazor.Core.Communication.Signaling.Hubs;
using Mazor.Core.Communication.Signaling.RealTime;

namespace Mazor.Core.Communication.Signaling.Hubs
{
	public class ConnectionStateManager : IConnectionStateManager
	{
		private IEnumerable<IConnectionEntry> _entries;

		public IEnumerable<IConnectionEntry> Entries { get { return _entries; } }

		public event ConnectionEntryStateChangedEvent EntryStateChanged;

		public ConnectionStateManager (IEnumerable<IConnectionEntry> entries)
		{
			if (entries == null) { throw new ArgumentNullException("entries"); }

			_entries = entries;
		}

		private void OnConnectionStateChanged (IConnectionEntry entry, ConnectionState oldState)
		{
			if (EntryStateChanged != null) { EntryStateChanged(entry, oldState); }
		}

		public IConnectionEntry Get (string connectionId)
		{
			return _entries.FirstOrDefault(c => c.Connection.Id == connectionId);
		}

		public void ChangeState (string cId, ConnectionState newState)
		{
			var entry = (ConnectionSource)Get(cId);

			if (entry.CurrentState != newState)
			{
				ConnectionState oldState = entry.CurrentState;
				entry.CurrentState = newState;
				OnConnectionStateChanged(entry, oldState);
			}
		}
	}
}