using System;
using System.Collections.Generic;
using System.Collections.Specialized;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Mazor.Core.Communication.Signaling.Messaging
{
	public class NotificationMessage
	{
		public readonly NotificationSubject Subject;
		public readonly string Body;
		public readonly Exception[] Errors;

		public NotificationMessage (NotificationSubject subject, string body, Exception[] errors)
		{
			if ((Subject = subject) == null) { throw new ArgumentNullException("subject"); }

			Body = body ?? string.Empty;
			Errors = errors ?? new Exception[] { };
		}
	}
}
