using Mazor.Core.Communication.Signaling.Delegating;
using Mazor.Core.Communication.Signaling.Enviorment;
using Mazor.Core.Communication.Signaling.Messaging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Principal;
using System.Text;
using System.Threading.Tasks;

namespace Mazor.Core.Communication.Signaling.RealTime
{
	public class Group : Connection
	{
		public string Name { get { return Socket.ConnectionId; } }
		public IEnumerable<Connection> Items { get; private set; }

		public Group (IPrincipal admin, ConnectionSocket socket, IEnumerable<Connection> items)
			: base (admin, socket)
		{
			if (admin == null) { throw new ArgumentNullException("admin"); }
			if (socket == null) { throw new ArgumentNullException("socket"); }
			if (items == null) { throw new ArgumentNullException("items"); }

			Items = items;
		}
	}
}
