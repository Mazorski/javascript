using Mazor.Core.Communication.Signaling.Hubs;
using Mazor.Core.Communication.Signaling.Delegating;
using Mazor.Core.Communication.Signaling.Messaging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Runtime.Remoting.Messaging;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using System.Web;
using Mazor.Core.Communication.Signaling.Entry;
using Mazor.Core.Communication.Signaling.Enviorment;
using System.Security.Principal;
using Mazor.Core.Communication.Signaling.RealTime;

namespace Mazor.Core.Communication.Signaling
{
	public sealed class Signal
	{
		private readonly SignalWorkerRequest Wr;
		private readonly PushSignalOrigin _origin;
		private readonly PushSignalContent _content;
		private readonly PushSignalCallBack _callBack;

		public static Signal Current
		{
			get { return CallContext.LogicalGetData("Signal") as Signal; }
		}

		public NotificationState State { get; set; }
		public PushSignalOrigin Origin { get { return _origin; } }
		public PushSignalContent Content { get { return _content; } }
		public PushSignalCallBack CallBack { get { return _callBack; } }
		public Hub Hub { get { return Wr.Site.Bindings.Hub; } }
		public Guid ContextIdentity { get { return Wr.SubjectId; } }
		public Uri Action { get { return Wr.Action; } }
		public SignalDelegatingHandler DelegatingHandler { get { return Wr.DelegatingHandler; } }
		public Type SignalType { get { return Wr.SyncObj.SignalType; } }
		public IDictionary<object, object> Items { get { return Wr.Items; } }
		public bool IsIncoming { get { return Wr.IsIncoming; } }
		public bool IsOutGoing { get { return !IsIncoming; } }
		public bool Ended { get { return Wr.SignaldEndOfWork; } }

		public Signal (SignalWorkerRequest wr)
		{
			if (wr == null) { throw new ArgumentNullException("wr"); }

			Wr = wr;
			_origin = new PushSignalOrigin(wr);
			_content = new PushSignalContent(wr);
			_callBack = new PushSignalCallBack(wr);
		}
	}
}
