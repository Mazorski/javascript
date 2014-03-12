using Mazor.Core.Communication.Signaling.Enviorment;
using Mazor.Core.Communication.Signaling.Messaging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Mazor.Core.Communication.Signaling.Enviorment
{
	public class IncomingSignal : RawSignalSource
	{
		public IncomingSignal (string connectionId, NotificationMessage msg)
			: base(connectionId, msg, r => { }, true) { }
	}
}
