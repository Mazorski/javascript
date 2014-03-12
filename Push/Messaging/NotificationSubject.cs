using System;
using System.Collections.Generic;
using System.Collections.Specialized;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Mazor.Core.Communication.Signaling.Messaging
{
	public class NotificationSubject
	{
		public readonly Guid Id;
		public readonly Uri Action;  
		public readonly bool CallBack;

		public NotificationSubject (Guid id, Uri action, bool callBack)
		{
			if (action == null) { throw new ArgumentNullException("action"); }

			Id = id;
			Action = action;
			CallBack = callBack;
		}
	}
}
