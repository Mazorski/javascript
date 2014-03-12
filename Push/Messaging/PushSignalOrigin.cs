using Mazor.Core.Communication.Signaling.Enviorment;
using Mazor.Core.Communication.Signaling.Hubs;
using Mazor.Core.Communication.Signaling.Delegating;
using Mazor.Core.Communication.Signaling.Entry;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Web;
using System.Web.Mvc;
using Mazor.Core.Communication.Signaling.RealTime;

namespace Mazor.Core.Communication.Signaling.Messaging
{
    public sealed class PushSignalOrigin
    {
		private readonly SignalWorkerRequest Wr;

		public EntrySyncObject Sync { get { return Wr.SyncObj; } }
		public Connection Source { get { return Wr.Site.Bindings.Hub.GetActiveConnection(Wr.SourceCId); } }
		public bool IsCallBackSignal { get { return Sync.Root.IsReEntry; } }
		public HttpContextBase Http { get { return Wr.Http; } }

		public PushSignalOrigin (SignalWorkerRequest wr)
		{
			if (wr == null) { throw new ArgumentNullException("wr"); }
			
			Wr = wr;
		}
    }
}
