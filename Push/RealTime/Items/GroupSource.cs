using Mazor.Core.Communication.Signaling.Delegating;
using Mazor.Core.Communication.Signaling.Hubs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Principal;
using System.Text;
using System.Threading.Tasks;

namespace Mazor.Core.Communication.Signaling.RealTime
{
	public class GroupSource : ConnectionSource
	{
		private ICollection<Connection> _items;
		private ConnectionEntryStateChangedEvent _stateChangedEvent; 

		public IEnumerable<Connection> Items { get { return _items.AsEnumerable(); } }
		public Group Group { get { return (Group)Connection; } }

		public event Action<Connection> ConnectionRemoved;
		public event Action<Connection> ConnectionAdded;

		public GroupSource (IPrincipal admin, ICollection<Connection> items, ConnectionSocket socket, Receiver receiver, ConnectionEntryStateChangedEvent stateChangedEvent)
			: base(new Group(admin, socket, items), receiver)
		{
			_items = items;

			_stateChangedEvent = (stateChangedEvent += (e, oState) =>
			{
				if (_items.Contains(e.Connection))
				{
					if (e.CurrentState == ConnectionState.Disconnected)
					{
						if (_items.Remove(e.Connection) && ConnectionRemoved != null) { ConnectionRemoved(e.Connection); }
					}
				}
			});
		}

		public void Add (Connection connection)
		{
			if (connection == null) { throw new ArgumentNullException("connection"); }
			if (Items.Any(c => c.Id == connection.Id)) { throw new InvalidOperationException("Already connected"); }

			_items.Add(connection);

			if (ConnectionAdded != null) { ConnectionAdded(connection); }
		}

		public void Remove (Connection connection)
		{
			if (_items.Contains(connection))
			{
				_items.Remove(connection);

				if (ConnectionRemoved != null) { ConnectionRemoved(connection); }
			}
		}
	}
}
