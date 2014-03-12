using Mazor.Core.Communication.Signaling.Hubs;
using Mazor.Core.Communication.Signaling.RealTime;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Mazor.Core.Communication.Signaling.Hubs
{
	public interface IConnectionEntry
	{
		Connection Connection { get; }

		ConnectionState CurrentState { get; }
	}
}
