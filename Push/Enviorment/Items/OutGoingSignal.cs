using Mazor.Core.Communication.Signaling.Enviorment;
using Mazor.Core.Communication.Signaling.Messaging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Mazor.Core.Communication.Signaling.Enviorment
{
	public class OutGoingSignal : RawSignalSource
	{
		public OutGoingSignal (string connectionId, NotificationMessage msg, AsyncCallback callback)
			: base(connectionId, msg, callback ?? (r => { }), false) { }
	}
}
