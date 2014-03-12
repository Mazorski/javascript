using Mazor.Core.Communication.Signaling.Delegating;
using Mazor.Core.Communication.Signaling.Entry;
using Mazor.Core.Serialization;
using System;
using System.Collections.Generic;
using System.Dynamic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Mazor.Core.Communication.Signaling.Enviorment
{
	public class CallSiteSynchronizer
	{
		#region Fields
		private readonly IList<NotificationAsyncResult> _results = new List<NotificationAsyncResult>();
		#endregion

		#region NonPublic members
		protected NotificationAsyncResult Get (EntrySyncRoot root)
		{
			return _results.First(r => r.SyncObj.Root == root);
		}

		protected NotificationAsyncResult Set (NotificationState state)
		{
			EntrySyncObject syncObj = state.Signal.Origin.Sync;
			EntrySyncRoot root = GetSyncRoot(syncObj.Root.Subject.Id);
			NotificationAsyncResult sync = new NotificationAsyncResult(state.Signal.Hub, syncObj);

			if (root != null)
			{
				NotificationAsyncResult current = Get(root);

				if (current.SyncObj.Root.TimeStamp >= syncObj.Root.TimeStamp)
				{
					throw new InvalidOperationException(
						string.Format("Given syncObj is same or older then existing one, '{0}' > '{1}'",
						current.SyncObj.Root.TimeStamp.Ticks, syncObj.Root.TimeStamp.Ticks));
				}

				sync.UseWaitEvent.SetCallUse(o => { if (!current.IsOpEnded) { current.UseWaitEvent.Use(o); } });
				_results.Remove(current);
			}

			_results.Add(sync);
			syncObj.Root.Disposing += () => _results.Remove(sync);
			sync.Begin(null, null);

			return sync;
		}
		#endregion

		#region Members
		public EntrySyncObject GetSyncObj (EntrySyncRoot root)
		{
			return Get(root).SyncObj;
		}

		public EntrySyncRoot GetSyncRoot (Guid sId)
		{
			return _results.Select(r => r.SyncObj.Root).FirstOrDefault(r => r.Subject.Id == sId);
		}

		public virtual IAsyncResult Sync (NotificationState state)
		{
			NotificationAsyncResult sync = Set(state);

			if (sync.SyncObj.Root.IsReEntry)
			{
				if (!sync.IsOpEnded) { sync.UseWaitEvent.Use(state); }
			}

			return sync;
		}
		#endregion
	}
}
