using Mazor.Core.Communication.Signaling.Hubs;
using Mazor.Core.Communication.Signaling.Entry;
using System;
using System.Collections.Generic;
using System.Collections.Specialized;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Runtime.Remoting.Messaging;
using System.Text;
using System.Threading.Tasks;
using Mazor.Core.Communication.Signaling.RealTime;

namespace Mazor.Core.Communication.Signaling.Messaging
{
	public sealed class PushSignalCallBack
	{
		private readonly SignalWorkerRequest Wr;

		public TextWriter Body { get { return Wr.OutPutSignalBodyWriter; } }
		public ICollection<Exception> Errors { get { return Wr.OutPutSignalState; } }
		public bool IsContextValid { get { return Errors.Count() == 0; } }

		public Connection Target 
		{
			get { return Wr.Site.Bindings.Hub.GetActiveConnection(Wr.OutPutTargetCId()); } set { Wr.OutPutTargetCId(value.Id); }
		}

		public Uri Action
		{
			get { return Wr.OutPutSignalAction(); } set { Wr.OutPutSignalAction(value); }
		}

		public bool SignalBack
		{
			get { return Wr.SendOutPutSignal(); } set { Wr.SendOutPutSignal(value); }
		}

		public bool SpecifyState
		{
			get { return Wr.SpecifyOutPutSignalState(); } set { Wr.SpecifyOutPutSignalState(value); }
		}

		public bool ExpectSignal
		{
			get { return Wr.ExpectInputSignal(); } set { Wr.ExpectInputSignal(value); }
		}

		public PushSignalCallBack (SignalWorkerRequest wr)
		{
			if (wr == null) { throw new ArgumentNullException("wr"); }

			Wr = wr;
		}

		public void EndWithoutSend ()
		{
			SignalBack = false;
			End();
		}

		public void EndWithSend ()
		{
			SignalBack = true;
			End();
		}

		public void End ()
		{
			Wr.SignalEndOfWork(this);
		}
	}
}
