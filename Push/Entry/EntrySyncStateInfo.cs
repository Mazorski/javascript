using Mazor.Core.Communication.Signaling.Enviorment;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace Mazor.Core.Communication.Signaling.Entry
{
	public class EntrySyncStateInfo
	{
		private CallSiteSynchronizer _synchronizer;
		private Guid _identity;


		public CallSiteSynchronizer Synchronizer { get { return _synchronizer; } }
		public Guid RootIdentity { get { return _identity; } }
		public WaitHandle UseWaitEvent { get; set; }
		public EntrySyncRoot Root { get; set; }

		public EntrySyncStateInfo (CallSiteSynchronizer synchronizer, Guid rootIdentity)
		{
			if (synchronizer == null) { throw new ArgumentNullException("synchronizer"); }

			_synchronizer = synchronizer;
			_identity = rootIdentity;
		}   

		public void Update (EntrySyncObject syncObj)
		{
			if (syncObj == null) { throw new ArgumentNullException("syncObj"); }
		}
	}
}
