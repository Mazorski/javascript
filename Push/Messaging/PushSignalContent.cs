using Mazor.Core.Serialization;
using Mazor.Core.Communication.Signaling.Hubs;
using System;
using System.Collections.Generic;
using System.Collections.Specialized;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Reflection;
using System.Security.Principal;
using System.Text;
using System.Threading.Tasks;
using System.Web;
using Mazor.Core.Communication.Web;
using System.IO;
using System.Web.Mvc;
using Mazor.Core.Communication.Signaling.Entry;

namespace Mazor.Core.Communication.Signaling.Messaging
{
	public sealed class PushSignalContent
	{
		private readonly SignalWorkerRequest Wr;

		public TextReader Body { get { return Wr.InPutSignalBodyReader; } }
		public Exception[] Errors { get { return Wr.InPutSignalState; } }
		public bool IsContextValid { get { return Errors.Count() == 0; } } 
		public object Model { get; set; }

		public PushSignalContent (SignalWorkerRequest wr)
		{
			if (wr == null) { throw new ArgumentNullException("wr"); }

			Wr = wr;
		}
	}
}
