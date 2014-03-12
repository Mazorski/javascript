using Mazor.Core.Communication.Signaling.Hubs;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Mazor.Core.Communication.Signaling.RealTime
{
	public class ConnectionSourceCollection : IEnumerable<IConnectionEntry>, ICollection<ConnectionSource>
	{
		#region Fields
		private IList<ConnectionSource> _sources;
		private IConnectionStateManager _stateManager; 
		#endregion

		#region Properties
		public IConnectionStateManager StateManager { get { return _stateManager; } }
		#endregion

		#region Constructors
		public ConnectionSourceCollection ()
		{
			_stateManager = new ConnectionStateManager(this);
			_sources = new List<ConnectionSource>();

			StateManager.EntryStateChanged += StateManager_EntryStateChanged;
		} 
		#endregion

		#region NonPublic members
		private void StateManager_EntryStateChanged (IConnectionEntry entry, ConnectionState oldState)
		{
			if (entry.CurrentState == ConnectionState.Disconnected)
			{
				_sources.Remove(Get(entry.Connection.Id));
			}
		} 
		#endregion

		#region Members
		public ConnectionSource Get (string cId)
		{ 
			return _sources.FirstOrDefault(s => s.Connection.Id == cId); 
		}
		
		public bool Remove (ConnectionSource item) 
		{
			return _sources.Remove(item); 
		}

		public void Add (ConnectionSource item)
		{
			if (_sources.Any(s => s.Connection.Id == item.Connection.Id)) { throw new InvalidOperationException("a source with the same id already exist"); }

			_sources.Add(item);
		} 
		#endregion

		#region ICollection<ConnectionSource>
		int ICollection<ConnectionSource>.Count { get { return _sources.Count; } }
		bool ICollection<ConnectionSource>.IsReadOnly { get { return _sources.IsReadOnly; } }
		void ICollection<ConnectionSource>.Clear () { _sources.Clear(); }
		bool ICollection<ConnectionSource>.Contains (ConnectionSource item) { return _sources.Contains(item); }
		void ICollection<ConnectionSource>.CopyTo (ConnectionSource[] array, int arrayIndex) { _sources.CopyTo(array, arrayIndex); }
		IEnumerator<ConnectionSource> IEnumerable<ConnectionSource>.GetEnumerator () { return _sources.GetEnumerator(); }
		#endregion

		#region IEnumerable<IConnectionEntry>
		IEnumerator<IConnectionEntry> IEnumerable<IConnectionEntry>.GetEnumerator () { return _sources.GetEnumerator(); }
		IEnumerator IEnumerable.GetEnumerator () { return _sources.GetEnumerator(); } 
		#endregion

	}
}
